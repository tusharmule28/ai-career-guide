from fastapi import APIRouter
from schemas.health import HealthCheckResponse
from core.config import settings
from db.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import Depends

router = APIRouter()

@router.get("/health", response_model=HealthCheckResponse)
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify API and vector DB status.
    """
    vector_ok = False
    try:
        result = db.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'")).first()
        vector_ok = result is not None
    except Exception:
        vector_ok = False
        
    return HealthCheckResponse(
        status="active",
        environment=settings.ENVIRONMENT,
        version=settings.VERSION,
        vector_extension=vector_ok
    )
