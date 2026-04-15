from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.router import api_router
from db.database import Base, engine
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

redis_uri = settings.REDIS_URL or f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
limiter = Limiter(key_func=get_remote_address, default_limits=["1000/minute"], storage_uri=redis_uri)

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Core API for the AI Job Matching platform",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Configure CORS
    
    import urllib.parse

    def clean_origin(o: str) -> str:
        # Strip whitespace, quotes, and trailing slashes to ensure exact origin matching
        o = o.strip().strip('"').strip("'").rstrip('/')
        try:
            parsed = urllib.parse.urlparse(o)
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            pass
        return o
    
    # Traceback exception handler for production debugging — logs 500 errors to the console
    import traceback
    from fastapi.responses import JSONResponse
    from fastapi import Request
    
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"CRITICAL: 500 Internal Server Error in {request.url.path}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal Server Error",
                "message": str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred"
            }
        )

    # Safety guard: strip wildcards — "*" + allow_credentials=True is illegal per HTTP spec
    _raw_origins = settings.ALLOWED_ORIGINS or ""
    allowed_origins = [clean_origin(o) for o in _raw_origins.split(",") if o.strip() and clean_origin(o) != "*"]

    # Fallback: if ALLOWED_ORIGINS is empty or was only "*", use environment-aware defaults
    if not allowed_origins:
        # We explicitly add the Vercel/Netlify origins to ensure they're always allowed in both dev and prod
        # to prevent common configuration issues on Render.
        allowed_origins = [
            "https://ai-career-guide-rho.vercel.app",
            "https://ai-careerguide.netlify.app",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
        ]

    print(f"DEBUG: ENVIRONMENT={settings.ENVIRONMENT} | CORS Origins: {allowed_origins}")
    
    # Layer order: Register exception handler, then CORS middleware
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,
    )

    @app.get("/api/v1/debug-cors")
    def get_cors_debug():
        return {
            "environment": settings.ENVIRONMENT,
            "raw_origins": _raw_origins,
            "allowed_origins": allowed_origins,
        }

    # Include API router
    app.include_router(api_router, prefix="/api/v1")

    @app.on_event("startup")
    async def on_startup():
        import traceback
        import time
        from sqlalchemy import text
        from db.database import SessionLocal, Base, engine
        from services.user_service import UserService
        from schemas.user import UserCreate
        
        print(f"[*] Starting application initialization...")
        start_time = time.time()

        # Force-import ALL models so Base.metadata knows about every table
        import models.job      # noqa: F401
        import models.resume   # noqa: F401
        import models.user     # noqa: F401
        import models.saved_job # noqa: F401
        import models.application # noqa: F401
        
        # Ensure all tables exist before seeding
        try:
            # Check connection first
            with engine.connect() as conn:
                print(f"[+] Database connection successful.")
                
                # Create extension if it doesn't exist (required for pgvector)
                print(f"[*] Ensuring pgvector extension exists...")
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
            
            # Note: We no longer run Base.metadata.create_all(bind=engine) here.
            # Schema migrations are handled via Alembic explicitly.
            print("[+] Database connection and extension verified. Schema is managed by Alembic.")
            
        except Exception as e:
            print(f"[!] CRITICAL: Error initializing database: {e}")
            print(traceback.format_exc())
            # We don't exit here, but the app might fail later if DB is unreachable

        # Seeding
        db = SessionLocal()
        try:
            user_service = UserService(db)
            admin_email = "admin@example.com"
            admin_password = "admin123"
            
            # Check if the specific admin exists
            admin_user = user_service.get_user_by_email(admin_email)
            if not admin_user:
                print(f"[*] Admin {admin_email} not found. Seeding now...")
                user_in = UserCreate(
                    email=admin_email,
                    password=admin_password,
                    name="System Admin"
                )
                user_service.create_user(user_in)
                print(f"[+] Default admin created successfully.")
            else:
                print(f"[+] Admin {admin_email} already exists.")
        except Exception as e:
            print(f"[!] Error seeding admin: {e}")
        finally:
            db.close()
            
        end_time = time.time()
        print(f"[+] Initialization completed in {end_time - start_time:.2f} seconds.")

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
