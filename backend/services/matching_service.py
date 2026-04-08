from sqlalchemy.orm import Session
from sqlalchemy import select, func
from models.job import Job
from models.resume import Resume
from services.embedding_service import embedding_service
from typing import List, Dict, Any
from core.config import settings
import asyncio
import json
import logging
from groq import AsyncGroq

logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(self):
        self.groq_client = None
        if settings.GROQ_API_KEY:
            try:
                self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")

    async def _analyze_skill_gap_with_ai(self, resume_text: str, job: Job, match_data: Dict):
        """Use Groq to analyze skill gap."""
        if not self.groq_client: return
        
        prompt = f"""
        Analyze the exact skill gap between this candidate's resume and the job description.
        Return ONLY valid JSON in this exact format: {{"found_skills": ["skill1"], "missing_skills": ["skill2"]}}
        Do not include markdown blocks or any other text.
        
        Job Title: {job.title}
        Job Requirements/Skills: {', '.join(job.required_skills) if job.required_skills else (job.description[:500] if job.description else '')}
        
        Candidate Resume: {resume_text[:2000]}
        """
        try:
            completion = await self.groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            response = json.loads(completion.choices[0].message.content)
            match_data["found_skills"] = response.get("found_skills", match_data["found_skills"])
            match_data["missing_skills"] = response.get("missing_skills", match_data["missing_skills"])
        except Exception as e:
            logger.error(f"Groq API error for job {job.id}: {e}")

    async def find_matches(self, db: Session, resume_text: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Find the best job matches for a given resume text using pgvector.
        Utilizes the cosine distance operator (<=>).
        """
        # 1. Generate embedding for the input resume text
        embeddings = await embedding_service.generate_embedding(resume_text)
        resume_embedding = embeddings.tolist()
        
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
            # Enhanced similarity scoring for better "Experience"
            # Cosine distance is 0 to 2 for vectors. 0 is exact same.
            # We scale it so typical matches (0.1 - 0.4 distance) look like 70% - 95%
            dist = float(distance)
            match_score = max(0, (1.2 - dist) * 83.3) # Scaled boost for better UX
            if match_score > 100: match_score = 98.5 # Cap it but keep it high for good matches
            
            # Simple skill-gap analysis
            # We compare the job's required skills with the resume text (case-insensitive)
            required_skills = job.required_skills if isinstance(job.required_skills, list) else []
            found_skills = []
            missing_skills = []
            
            resume_text_lower = resume_text.lower()
            for skill in required_skills:
                if skill.lower() in resume_text_lower:
                    found_skills.append(skill)
                else:
                    missing_skills.append(skill)
            
            results.append({
                "job": job,
                "score": round(max(0, match_score), 2),
                "found_skills": found_skills,
                "missing_skills": missing_skills,
                "apply_url": job.apply_url,
                "source": job.source
            })
            
        # Enhance top 3 results with Groq API concurrently
        if self.groq_client and results:
            tasks = []
            for i, res in enumerate(results[:3]):
                tasks.append(self._analyze_skill_gap_with_ai(resume_text, res["job"], res))
            await asyncio.gather(*tasks)
            
        return results

    async def update_job_embedding(self, db: Session, job: Job):
        """
        Update the vector embedding for a single job based on its content.
        """
        content = f"{job.title} {job.description} {' '.join(job.required_skills)}"
        embedding = await embedding_service.generate_embedding(content)
        job.embedding = embedding.tolist()
        db.add(job)
        db.commit()

    async def update_resume_embedding(self, db: Session, resume: Resume):
        """
        Update the vector embedding for a resume.
        """
        if not resume.extracted_text:
            return
            
        embedding = await embedding_service.generate_embedding(resume.extracted_text)
        resume.embedding = embedding.tolist()
        db.add(resume)
        db.commit()

matching_service = MatchingService()
