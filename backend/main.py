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
    allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")] if settings.ALLOWED_ORIGINS else ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
            # Check if any user exists
            users = user_service.get_users(limit=1)
            if not users:
                print("No users found. Seeding default admin...")
                user_in = UserCreate(
                    email="admin@example.com",
                    password="Admin@123",
                    name="System Admin"
                )
                user_service.create_user(user_in)
                print("Default admin created: admin@example.com / Admin@123")
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
