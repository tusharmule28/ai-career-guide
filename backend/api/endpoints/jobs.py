from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from models.job import Job
from schemas.job import JobResponse, JobCreate
from services.matching_service import matching_service

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    
    # If no jobs exist, let's create some seed data for demonstration
    if not jobs:
        seed_jobs = [
            Job(
                title="Frontend Developer",
                company="TechCorp",
                location="Remote",
                description="Looking for a React expert with Tailwind CSS experience.",
                required_skills=["React", "Tailwind CSS", "JavaScript", "Vite"]
            ),
            Job(
                title="Backend Engineer",
                company="DataSystems",
                location="New York",
                description="FastAPI and PostgreSQL specialist needed for high-scale systems.",
                required_skills=["Python", "FastAPI", "PostgreSQL", "Docker"]
            ),
            Job(
                title="Fullstack Developer",
                company="AI Solutions",
                location="San Francisco",
                description="Build the future of AI tools with Next.js and Python.",
                required_skills=["Next.js", "Python", "TypeScript", "LLMs"]
            )
        ]
        for job in seed_jobs:
            db.add(job)
        db.commit()
        
        # Backfill embeddings for seed jobs
        for job in seed_jobs:
            matching_service.update_job_embedding(db, job)
            
        jobs = db.query(Job).all()
        
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
