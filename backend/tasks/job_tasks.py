import logging
import asyncio
from typing import List
from celery import shared_task
from db.database import SessionLocal
from scrapers.job_fetcher import job_fetcher
from scrapers.indian_jobs_scraper import indian_jobs_scraper
from services.matching_service import matching_service
from models.resume import Resume
from core.celery_app import celery_app

logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

@celery_app.task(name="tasks.sync_all_jobs")
def sync_all_jobs():
    """
    Background task to sync jobs from all sources.
    This replaces the async synchronized loop in main.py.
    """
    logger.info("Starting background job sync task...")
    db = SessionLocal()
    try:
        # Since scrapers are async, we need a way to run them in the synchronous Celery worker
        # We use a new event loop for this task
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Run sync
        loop.run_until_complete(job_fetcher.sync_jobs(db))
        
        logger.info("Background job sync completed successfully.")
    except Exception as e:
        logger.error(f"Error in background job sync: {e}")
    finally:
        db.close()

@celery_app.task(name="tasks.recalculate_user_matches")
def recalculate_user_matches(resume_id: int):
    """
    Task to recalculate job matches for a user when they upload a new resume.
    """
    logger.info(f"Recalculating matches for resume_id: {resume_id}...")
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume or not resume.extracted_text:
            logger.warning(f"Resume {resume_id} not found or has no text.")
            return

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Update resume embedding if needed
        loop.run_until_complete(matching_service.update_resume_embedding(db, resume))
        
        # We don't necessarily need to store matches in a table if we query them on the fly,
        # but we could pre-cache them here.
        
        logger.info(f"Matches recalculated for resume_id: {resume_id}")
    except Exception as e:
        logger.error(f"Error recalculating matches: {e}")
    finally:
        db.close()
