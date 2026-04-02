from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.router import api_router
from db.database import Base, engine



def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Core API for the AI Job Matching platform",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Configure CORS
    # Safety guard: strip wildcards — "*" + allow_credentials=True is illegal per HTTP spec
    _raw_origins = settings.ALLOWED_ORIGINS or ""
    allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip() and o.strip() != "*"]

    # Fallback: if ALLOWED_ORIGINS is empty or was only "*", use environment-aware defaults
    if not allowed_origins:
        if settings.ENVIRONMENT == "production":
            allowed_origins = ["https://ai-career-guide-rho.vercel.app"]
        else:
            allowed_origins = [
                "https://ai-career-guide-rho.vercel.app",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8080",
            ]

    print(f"DEBUG: ENVIRONMENT={settings.ENVIRONMENT} | CORS Origins: {allowed_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Include API router
    app.include_router(api_router, prefix="/api/v1")

    @app.on_event("startup")
    async def on_startup():
        from db.database import SessionLocal, Base, engine
        from services.user_service import UserService
        from schemas.user import UserCreate
        
        # Ensure all tables exist before seeding
        try:
            # Create extension if it doesn't exist (required for pgvector)
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
            
            Base.metadata.create_all(bind=engine)
            print("Database tables initialized.")
        except Exception as e:
            print(f"Error initializing database: {e}")

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
