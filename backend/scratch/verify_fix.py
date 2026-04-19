import asyncio
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.user import User
from services.matching_service import matching_service

async def verify_matching_response():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if not user:
            print("Admin user not found, cannot test matching.")
            return

        print(f"Testing matching for user: {user.email}")
        resume_text = "Experienced React developer with Python and FastAPI skills."
        
        matches = await matching_service.find_matches(db, user, resume_text, top_n=1)
        
        if not matches:
            print("No matches found to verify.")
            return
            
        # This simulates the logic in the router
        match = matches[0]
        job = match["job"]
        
        # Check if 'id' exists on the job object
        if hasattr(job, 'id'):
            print(f"SUCCESS: Job ID found: {job.id}")
        else:
            print("FAILURE: Job ID not found on row proxy object.")
            
        # The fix was in the router response data
        response_item = {
            "id": job.id,
            "title": job.title,
            # ... and so on
        }
        print(f"Simulated response item: {response_item}")
        
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(verify_matching_response())
