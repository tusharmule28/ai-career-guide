from typing import Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Job Matching API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    
    # Admin Credentials
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin123"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_postgres_prefix(cls, v: str) -> str:
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    # File Uploads
    UPLOAD_DIR: str = "uploads/resumes"

    # AI Models
    HUGGING_FACE_API_TOKEN: str = ""
    GROQ_API_KEY: str = ""

    # Supabase (Storage)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Azure Always-Free Services
    AZURE_COSMOS_CONNECTION_STRING: str = ""
    AZURE_COSMOS_DATABASE_ID: str = "JobMatchingDB"
    AZURE_COSMOS_CONTAINER_ID: str = "EmbeddingsCache"
    APPLICATIONINSIGHTS_CONNECTION_STRING: str = ""

    # Email (Resend - Free Tier)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev" # Default for testing

    # Constants limits/Auth for jobs
    CRON_SECRET: str = "default_cron_secret_replace_in_prod"

    # Frontend URL
    FRONTEND_URL: str = "https://ai-careerguide.netlify.app"

    # CORS - leave empty to use environment-aware defaults in main.py
    # Set explicitly to override: "https://yourdomain.com,https://other.com"
    ALLOWED_ORIGINS: str = ""

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: Optional[str] = None
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""

    # Security
    # In a real application, you must change this to a secure secret key
    SECRET_KEY: str = "72997184719284719284719284712847129847129847"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()
