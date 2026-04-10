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

limiter = Limiter(key_func=get_remote_address)

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
        print(f"CRITICAL: 500 Internal Server Error in {request.url.path}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )

    # Safety guard: strip wildcards — "*" + allow_credentials=True is illegal per HTTP spec
    _raw_origins = settings.ALLOWED_ORIGINS or ""
    allowed_origins = [clean_origin(o) for o in _raw_origins.split(",") if o.strip() and clean_origin(o) != "*"]

    # Fallback: if ALLOWED_ORIGINS is empty or was only "*", use environment-aware defaults
    if not allowed_origins:
        # We explicitly add the Vercel origin to ensure it's always allowed in both dev and prod
        # to prevent common configuration issues on Render.
        allowed_origins = [
            "https://ai-career-guide-rho.vercel.app",
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
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
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
        from db.database import SessionLocal, Base, engine
        from services.user_service import UserService
        from schemas.user import UserCreate
        
        # Force-import ALL models so Base.metadata knows about every table
        import models.job      # noqa: F401
        import models.resume   # noqa: F401
        import models.user     # noqa: F401
        import models.saved_job # noqa: F401
        import models.application # noqa: F401
        
        # Ensure all tables exist before seeding
        try:
            # Create extension if it doesn't exist (required for pgvector)
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
            
            # Manual schema patches for Render compatibility (Alembic falls out of sync because of create_all)
            try:
                from sqlalchemy import text
                with engine.connect() as conn:
                    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR;'))
                    conn.commit()
                print("Manual schema migrations applied successfully.")
            except Exception as e:
                print(f"Warning: Manual schema migration failed: {e}")
                
            Base.metadata.create_all(bind=engine)
            print("Database tables initialized.")
            
            # Verify jobs table was created
            from sqlalchemy import inspect as sa_inspect
            inspector = sa_inspect(engine)
            tables = inspector.get_table_names()
            print(f"Tables in database: {tables}")
        except Exception as e:
            print(f"Error initializing database: {e}")
            print(traceback.format_exc())

        db = SessionLocal()
        try:
            user_service = UserService(db)
            admin_email = "admin@example.com"
            admin_password = "admin123"
            
            # Check if the specific admin exists
            admin_user = user_service.get_user_by_email(admin_email)
            if not admin_user:
                print(f"Admin {admin_email} not found. Seeding now...")
                user_in = UserCreate(
                    email=admin_email,
                    password=admin_password,
                    name="System Admin"
                )
                user_service.create_user(user_in)
                print(f"Default admin created successfully.")
            else:
                print(f"Admin {admin_email} already exists.")
        except Exception as e:
            print(f"Error seeding admin: {e}")
        finally:
            db.close()

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
