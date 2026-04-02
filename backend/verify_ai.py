import sys
import os
import asyncio

# Add backend to path
sys.path.append(os.getcwd())

from services.embedding_service import embedding_service
from db.database import SessionLocal
from services.matching_service import matching_service
from models.job import Job

async def test_matching():
    print("Testing Embedding Service...")
    text = "Python developer with FastAPI experience"
    embedding = embedding_service.generate_embedding(text)
    print(f"Embedding generated. Shape: {embedding.shape}")
    
    print("\nTesting Matching Service...")
    db = SessionLocal()
    try:
        # 1. Ensure some jobs exist
        jobs = db.query(Job).all()
        if not jobs:
            print("No jobs found, seed data might be needed.")
            return

        # 2. Build index
        matching_service.build_index(db)
        
        # 3. Find matches
        matches = await matching_service.find_matches(db, text)
        print(f"Found {len(matches)} matches.")
        for match in matches:
            job = match["job"]
            print(f"- {job.title} at {job.company}: Score {match['score']}%")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_matching())
