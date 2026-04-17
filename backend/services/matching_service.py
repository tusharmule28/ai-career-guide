from sqlalchemy.orm import Session
from sqlalchemy import select, func
from models.job import Job
from models.resume import Resume
from models.user import User
from services.embedding_service import embedding_service
from typing import List, Dict, Any, Optional
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

    async def find_matches(
        self, 
        db: Session, 
        user: User,
        resume_text: str, 
        top_n: int = 10, 
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Find best job matches using weighted scoring.
        Optimized to avoid loading full descriptions for all candidates.
        """
        # 1. Base Embedding Search
        embeddings = await embedding_service.generate_embedding(resume_text)
        resume_embedding = embeddings.tolist()
        
        # Fetch fewer fields initially to save memory
        fetch_limit = 50 
        query = (
            db.query(
                Job.id, Job.title, Job.company, Job.location, 
                Job.required_skills, Job.experience_min, Job.experience_max, 
                Job.work_type, Job.company_logo, Job.apply_url,
                Job.embedding.cosine_distance(resume_embedding).label("distance")
            )
            .filter(Job.embedding != None)
            .order_by("distance")
            .limit(fetch_limit)
        )
        
        candidates = query.all()
        results = []
        
        user_skills = set(s.strip().lower() for s in (user.skills or "").split(",") if s.strip())
        user_exp = user.experience_years or 0
        user_loc = (user.location or "").lower()

        for cand in candidates:
            # cand is now a keyed tuple, not a Job object
            # cand: (id, title, company, location, required_skills, exp_min, exp_max, work_type, logo, apply_url, distance)
            
            # --- A. Skill Score (50%) ---
            semantic_sim = max(0, (1.2 - float(cand.distance)) * 83.3)
            
            job_skills = [s.lower() for s in cand.required_skills] if cand.required_skills else []
            if job_skills:
                overlap = len(user_skills.intersection(set(job_skills)))
                keyword_score = (overlap / len(job_skills)) * 100
                skill_score = (semantic_sim * 0.4) + (keyword_score * 0.6)
            else:
                skill_score = semantic_sim

            # --- B. Experience Score (30%) ---
            exp_score = 100
            j_min = cand.experience_min or 0
            j_max = cand.experience_max or (j_min + 3)
            
            if user_exp < j_min:
                diff = j_min - user_exp
                exp_score = max(0, 100 - (diff * 20)) 
            elif user_exp > j_max + 2:
                exp_score = 80 
            
            # --- C. Location Score (20%) ---
            loc_score = 0
            job_loc = (cand.location or "").lower()
            work_type = (cand.work_type or "On-site").lower()

            if work_type == "remote":
                loc_score = 100
            elif user_loc and job_loc:
                if user_loc in job_loc or job_loc in user_loc:
                    loc_score = 100
                elif "," in user_loc and "," in job_loc:
                    u_country = user_loc.split(",")[-1].strip().lower()
                    j_country = job_loc.split(",")[-1].strip().lower()
                    if u_country == j_country:
                        loc_score = 80
                    else:
                        loc_score = 20
                else:
                    loc_score = 30
            else:
                loc_score = 50

            final_score = (skill_score * 0.5) + (exp_score * 0.3) + (loc_score * 0.2)
            
            reasons = []
            if skill_score > 80: reasons.append("Strong skill alignment")
            if loc_score == 100: reasons.append("Located in your area" if work_type != "remote" else "Remote opportunity")
            if exp_score == 100: reasons.append("Fits your experience level")
            if not reasons: reasons.append("Matches your career profile")

            results.append({
                "job": cand, # Note: this is a row proxy, might need to be converted to dict or Job object for the frontend
                "score": round(final_score, 1),
                "match_reason": reasons[0],
                "all_reasons": reasons,
                "found_skills": list(user_skills.intersection(set(job_skills))),
                "missing_skills": list(set(job_skills) - user_skills)
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        paginated_results = results[skip : skip + min(top_n, 20)]

        # Enhance top results with AI
        if self.groq_client and paginated_results:
            ai_tasks = []
            for res in paginated_results[:3]:
                # We need the description for AI analysis, so fetch it lazily
                full_job = db.query(Job).filter(Job.id == res["job"].id).first()
                if full_job:
                    ai_tasks.append(self._analyze_skill_gap_with_ai(resume_text, full_job, res))
            if ai_tasks:
                await asyncio.gather(*ai_tasks)

        return paginated_results

    async def calculate_score(self, text: str, job: Job, user: User) -> Dict[str, Any]:
        """Solo score calculation for a specific job."""
        embeddings = await embedding_service.generate_embedding(text)
        # Simple Euclidean Distance logic for single job
        # (This is a simplification of the find_matches logic)
        import numpy as np
        
        job_emb = np.array(job.embedding) if job.embedding else None
        if job_emb is None:
            return {"score": 0, "missing_skills": []}
            
        distance = np.linalg.norm(np.array(embeddings) - job_emb)
        
        user_skills = set(s.strip().lower() for s in (user.skills or "").split(",") if s.strip())
        job_skills = [s.lower() for s in job.required_skills] if job.required_skills else []
        
        missing = list(set(job_skills) - user_skills)
        
        # Basic heuristic score
        score = max(0, 100 - (distance * 50))
        return {"score": round(score, 1), "missing_skills": missing}

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
