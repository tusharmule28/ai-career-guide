from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from core.config import settings
from db.database import SessionLocal
from scrapers.job_fetcher import job_fetcher
from services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

def verify_cron_secret(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify that the cron request came from an authorized external cron service."""
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid cron secret",
        )
    return True

async def run_sync_and_notify():
    db = SessionLocal()
    try:
        logger.info("Cron Job Sync: Starting...")
        new_jobs = await job_fetcher.sync_jobs(db)
        if new_jobs:
            logger.info(f"Sync complete. Processing notifications for {len(new_jobs)} new jobs...")
            await notification_service.notify_matching_users(db, new_jobs)
        logger.info("Cron Job Sync: Completed.")
    except Exception as e:
        logger.error(f"Cron Job Sync Error: {e}")
    finally:
        db.close()

@router.post("/sync", status_code=status.HTTP_202_ACCEPTED)
async def sync_jobs_cron(
    background_tasks: BackgroundTasks,
    _ = Depends(verify_cron_secret)
):
    """
    Trigger the background scraping process securely.
    Returns 202 Accepted immediately and runs process in background.
    """
    background_tasks.add_task(run_sync_and_notify)
    return {"status": "accepted", "message": "Job sync initiated in background"}
