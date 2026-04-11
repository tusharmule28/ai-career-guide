from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from typing import List, Optional
import logging
import traceback

from db.database import get_db, engine, Base
from models.job import Job
from models.saved_job import SavedJob
from models.user import User
from core.security import get_current_user
from schemas.job import JobResponse, JobCreate
from services.matching_service import matching_service
from tasks.job_tasks import sync_all_jobs

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/{job_id}/save", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a job for the current user."""
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already saved
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id
    ).first()
    
    if existing:
        return {"message": "Job already saved"}
    
    saved_job = SavedJob(user_id=current_user.id, job_id=job_id)
    db.add(saved_job)
    db.commit()
    return {"message": "Job saved successfully"}


@router.get("/saved", response_model=List[JobResponse])
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all jobs saved by the current user."""
    saved_jobs = db.query(Job).join(
        SavedJob, Job.id == SavedJob.job_id
    ).filter(SavedJob.user_id == current_user.id).all()
    
    return saved_jobs


def _ensure_jobs_table(db: Session):
    """Make sure the jobs table exists, create it if missing."""
    try:
        inspector = inspect(engine)
        if "jobs" not in inspector.get_table_names():
            logger.warning("'jobs' table not found — creating it now.")
            # Ensure pgvector extension exists first
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
            Job.__table__.create(bind=engine, checkfirst=True)
            logger.info("'jobs' table created successfully.")
    except Exception as e:
        logger.error(f"Error ensuring jobs table: {e}")
        raise


@router.post("/sync", status_code=status.HTTP_202_ACCEPTED)
async def sync_jobs(current_user: User = Depends(get_current_user)):
    """
    Manually trigger a background job synchronization from all sources via Celery.
    Only authenticated users can trigger sync.
    """
    task = sync_all_jobs.delay()
    return {
        "message": "Job synchronization started in the background.",
        "task_id": task.id
    }


@router.get("", response_model=List[JobResponse])
@router.get("/", response_model=List[JobResponse], include_in_schema=False)
async def get_jobs(
    skip: int = 0, 
    limit: int = 20,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Ensure table exists before querying
        _ensure_jobs_table(db)

        query = db.query(Job)
        
        # Apply filters
        if location and location != "All":
            query = query.filter(Job.location.ilike(f"%{location}%"))
        
        if job_type and job_type != "All":
            query = query.filter(Job.work_type.ilike(f"%{job_type}%"))
            
        jobs = query.order_by(Job.posted_at.desc()).offset(skip).limit(limit).all()

        # If no jobs exist, create some seed data for demonstration
        if not jobs:
            try:
                seed_jobs = [
                    Job(
                        title="Frontend Developer",
                        company="TechCorp",
                        location="Remote",
                        description="Looking for a React expert with Tailwind CSS experience.",
                        required_skills=["React", "Tailwind CSS", "JavaScript", "Vite"],
                        apply_url="https://example.com/apply/frontend",
                        source="Seed",
                        external_id="seed_1"
                    ),
                    Job(
                        title="Backend Engineer",
                        company="DataSystems",
                        location="New York",
                        description="FastAPI and PostgreSQL specialist needed for high-scale systems.",
                        required_skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
                        apply_url="https://example.com/apply/backend",
                        source="Seed",
                        external_id="seed_2"
                    ),
                    Job(
                        title="Fullstack Developer",
                        company="AI Solutions",
                        location="San Francisco",
                        description="Build the future of AI tools with Next.js and Python.",
                        required_skills=["Next.js", "Python", "TypeScript", "LLMs"],
                        apply_url="https://example.com/apply/fullstack",
                        source="Seed",
                        external_id="seed_3"
                    )
                ]
                for job in seed_jobs:
                    db.merge(job)  # merge avoids duplicate external_id crashes
                db.commit()

                # Backfill embeddings for seed jobs (non-critical)
                for job in seed_jobs:
                    try:
                        await matching_service.update_job_embedding(db, job)
                    except Exception as e:
                        logger.error(f"Failed to update job embedding during seed: {e}")

                jobs = db.query(Job).all()
            except Exception as e:
                db.rollback()
                logger.error(f"Failed to seed jobs: {e}")
                # Return empty list rather than crash
                jobs = []

        return jobs

    except Exception as e:
        logger.error(f"Error in get_jobs: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch jobs: {str(e)}"
        )


@router.get("/debug-table")
def debug_jobs_table(db: Session = Depends(get_db)):
    """Diagnostic endpoint to check the jobs table status."""
    info = {"table_exists": False, "row_count": 0, "error": None, "columns": []}
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        info["all_tables"] = tables
        info["table_exists"] = "jobs" in tables
        if info["table_exists"]:
            info["columns"] = [c["name"] for c in inspector.get_columns("jobs")]
            count = db.execute(text("SELECT COUNT(*) FROM jobs")).scalar()
            info["row_count"] = count
    except Exception as e:
        info["error"] = str(e)
    return info


@router.get("/{job_id}/insights")
async def get_job_insights(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get deep AI insights for a specific job relative to the current user.
    """
    from services.explanation import get_match_explanation, get_improvement_suggestions
    from models.resume import Resume
    
    _ensure_jobs_table(db)
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get user context
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    resume_text = resume.extracted_text if resume else ""
    profile_text = f"{current_user.job_title or ''} {current_user.bio or ''} {current_user.skills or ''}"
    combined_text = f"{profile_text} {resume_text}".strip()
    
    # Calculate match
    match_data = await matching_service.find_matches(db, current_user, combined_text, top_n=1)
    
    # Find specific match for this job
    # Since find_matches might return other jobs, we check if our job is in there or calculate it explicitly
    # For now, let's use the matching service to get specific score if possible or just rely on find_matches
    # Simplified for insights:
    specific_match = next((m for m in match_data if m["job"].id == job_id), None)
    
    if not specific_match:
        # If not in top, calculate solo
        score_info = await matching_service.calculate_score(combined_text, job, current_user)
        specific_match = {
            "score": score_info["score"],
            "missing_skills": score_info["missing_skills"],
            "match_reason": "Analysis complete"
        }

    # Get AI generated bits
    explanation = await get_match_explanation(combined_text, job.description)
    growth_path = await get_improvement_suggestions(specific_match.get("missing_skills", []))
    
    return {
        "job_id": job_id,
        "score": specific_match["score"],
        "match_explanation": explanation,
        "growth_path": growth_path,
        "missing_skills": specific_match.get("missing_skills", []),
        "found_skills": specific_match.get("found_skills", [])
    }
