import asyncio
from db.database import SessionLocal
from models.job import Job
from models.resume import Resume
from services.matching_service import matching_service

async def backfill_embeddings():
    db = SessionLocal()
    try:
        # Backfill Jobs
        jobs = db.query(Job).filter(Job.embedding == None).all()
        print(f"Backfilling {len(jobs)} jobs...")
        for job in jobs:
            await matching_service.update_job_embedding(db, job)
            
        # Backfill Resumes
        resumes = db.query(Resume).filter(Resume.embedding == None).all()
        print(f"Backfilling {len(resumes)} resumes...")
        for resume in resumes:
            await matching_service.update_resume_embedding(db, resume)
            
        print("Backfill complete.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(backfill_embeddings())
