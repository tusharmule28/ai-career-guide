from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from models.job import Job
from schemas.job import JobResponse, JobCreate
from services.matching_service import matching_service
from scrapers.job_fetcher import job_fetcher

router = APIRouter()

@router.post("/sync", status_code=status.HTTP_202_ACCEPTED)
async def sync_jobs(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Manually trigger a background job synchronization from all sources.
    """
    background_tasks.add_task(job_fetcher.sync_jobs, db)
    return {"message": "Job synchronization started in the background."}

@router.get("", response_model=List[JobResponse])
@router.get("/", response_model=List[JobResponse], include_in_schema=False)
async def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    
    # If no jobs exist, let's create some seed data for demonstration
    if not jobs:
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
            db.add(job)
        db.commit()
        
        # Backfill embeddings for seed jobs
        for job in seed_jobs:
            try:
                await matching_service.update_job_embedding(db, job)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to update job embedding during seed: {e}")
            
        jobs = db.query(Job).all()
        
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
