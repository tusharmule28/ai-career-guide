from sqlalchemy.orm import Session
from sqlalchemy import select, func
from models.job import Job
from models.resume import Resume
from services.embedding_service import embedding_service
from typing import List, Dict, Any

class MatchingService:
    def __init__(self):
        pass

    async def find_matches(self, db: Session, resume_text: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Find the best job matches for a given resume text using pgvector.
        Utilizes the cosine distance operator (<=>).
        """
        # 1. Generate embedding for the input resume text
        resume_embedding = embedding_service.generate_embedding(resume_text).tolist()
        
        # 2. Query jobs using Cosine Distance
        # We want to minimize distance, so order by <=> and limit
        # The score is relative to distance (1 - distance = similarity)
        query = (
            db.query(Job, Job.embedding.cosine_distance(resume_embedding).label("distance"))
            .filter(Job.embedding != None)
            .order_by("distance")
            .limit(top_n)
        )
        
        results = []
        for job, distance in query.all():
            # Convert cosine distance to a 0-100 similarity score
            # similarity = 1 - distance
            match_score = (1 - float(distance)) * 100
            results.append({
                "job": job,
                "score": round(max(0, match_score), 2)
            })
            
        return results

    def update_job_embedding(self, db: Session, job: Job):
        """
        Update the vector embedding for a single job based on its content.
        """
        content = f"{job.title} {job.description} {' '.join(job.required_skills)}"
        embedding = embedding_service.generate_embedding(content)
        job.embedding = embedding.tolist()
        db.add(job)
        db.commit()

    def update_resume_embedding(self, db: Session, resume: Resume):
        """
        Update the vector embedding for a resume.
        """
        if not resume.extracted_text:
            return
            
        embedding = embedding_service.generate_embedding(resume.extracted_text)
        resume.embedding = embedding.tolist()
        db.add(resume)
        db.commit()

matching_service = MatchingService()
