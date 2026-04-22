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

    def _calculate_project_score(self, resume_text: str) -> float:
        """
        Extract a basic project score from the resume text.
        Looks for key headings and count of project-related keywords.
        """
        if not resume_text:
            return 0.0
        
        text = resume_text.lower()
        # High-value markers for projects
        project_markers = ["project:", "projects", "portfolio", "github.com", "gitlab.com", "hackathon", "open source"]
        action_keywords = ["deployed", "implemented", "scaled", "architected", "developed", "integrated"]
        
        score = 0
        for marker in project_markers:
            if marker in text: score += 15
        
        for action in action_keywords:
            if action in text: score += 5
            
        return min(100, score)

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
        
        from models.application import Application

        # Fetch fewer fields initially to save memory
        # We increase fetch_limit slightly to ensure we have enough after filtering
        fetch_limit = top_n + skip + 50 
        
        # Subquery for applied jobs
        applied_job_ids = db.query(Application.job_id).filter(Application.user_id == user.id).subquery()

        query = (
            db.query(
                Job.id, Job.title, Job.company, Job.location, 
                Job.required_skills, Job.experience_min, Job.experience_max, 
                Job.work_type, Job.company_logo, Job.apply_url,
                Job.description, Job.source, Job.posted_at,
                Job.embedding.cosine_distance(resume_embedding).label("distance")
            )
            .filter(Job.embedding != None)
            .filter(~Job.id.in_(applied_job_ids))
            .order_by("distance")
            .limit(fetch_limit)
        )
        
        candidates = query.all()
        results = []
        
        def normalize_skill(s: str) -> str:
            return s.lower().replace(".", "").replace("-", "").strip()

        user_skills_raw = (user.skills or "").split(",")
        user_skills = set(normalize_skill(s) for s in user_skills_raw if s.strip())
        user_exp = user.experience_years or 0
        user_loc = (user.location or "").lower()

        for cand in candidates:
            # --- A. Skill Score (60%) ---
            # Semantic similarity starts at 0.0 - 1.0 (clamped distance)
            semantic_sim = max(0, min(100, (1.2 - float(cand.distance)) * 83.3))
            
            job_skills = [normalize_skill(s) for s in cand.required_skills] if cand.required_skills else []
            if job_skills:
                overlap = len(user_skills.intersection(set(job_skills)))
                keyword_score = (overlap / len(job_skills)) * 100
                
                # If we have literal keyword matches, they should dominate the skill score
                if overlap > 0:
                    skill_score = (semantic_sim * 0.3) + (keyword_score * 0.7)
                else:
                    skill_score = semantic_sim * 0.8 # Slightly penalize if no keywords match at all
            else:
                skill_score = semantic_sim

            # --- B. Experience Score (40%) ---
            j_min = cand.experience_min or 0
            j_max = cand.experience_max or (j_min + 3)
            
            # HARD FILTER: 1-2 year experience user should NOT see 5+ years experience jobs
            if user_exp <= 2 and j_min >= 5:
                continue
            
            # Large gap filter for other levels
            if j_min - user_exp >= 4:
                continue

            exp_score = 100
            if user_exp < j_min:
                # Underqualified
                diff = j_min - user_exp
                exp_score = max(0, 100 - (diff * 20)) 
                # "Sweet spot" check: 1-2 years user vs 1-3 years jobs
                if user_exp >= 1 and j_min <= 3:
                    exp_score = min(100, exp_score + 10)
            elif user_exp > j_max:
                # Overqualified
                over_years = user_exp - j_max
                if over_years > 2:
                    exp_score = max(40, 100 - ((over_years - 2) * 15))
            
            # --- C. Project Score (10%) ---
            project_score = self._calculate_project_score(resume_text)
            
            # --- C. Location Score (10%) ---
            loc_score = 0
            job_loc = (cand.location or "").lower()
            work_type = (cand.work_type or "On-site").lower()

            if work_type == "remote":
                loc_score = 100
            elif user_loc and job_loc:
                if user_loc in job_loc or job_loc in user_loc:
                    loc_score = 100
                else:
                    loc_score = 40
            else:
                loc_score = 70 # Neutral if data missing

            # --- Final Score Calculation ---
            # Re-balanced: Technical Skills 40%, Experience 40%, Projects 10%, Location/Title 10%
            designation_score = 100 if user.job_title and cand.title and (user.job_title.lower() in cand.title.lower() or cand.title.lower() in user.job_title.lower()) else 60
            
            final_score = (skill_score * 0.4) + (exp_score * 0.4) + (project_score * 0.1) + ((loc_score * 0.5 + designation_score * 0.5) * 0.1)
            
            # Recency Boost (Extra 5 pts)
            if cand.posted_at:
                from datetime import datetime, timezone, timedelta
                age = datetime.now(timezone.utc) - cand.posted_at.replace(tzinfo=timezone.utc)
                if age < timedelta(hours=48):
                    final_score += 5
            
            final_score = max(0, min(100, final_score))
            
            reasons = []
            if skill_score > 85: reasons.append("Excellent skill alignment")
            elif skill_score > 70: reasons.append("Strong technical fit")
            
            if exp_score >= 100: reasons.append("Perfect experience match")
            elif user_exp >= 1 and j_min <= 3 and exp_score >= 90: reasons.append("Ideal career-growth role")
            elif exp_score < 60: reasons.append("Slight experience gap")
            
            if project_score >= 70: reasons.append("Impressive project history")
            elif project_score >= 40: reasons.append("Relevant project experience")
            
            if loc_score == 100: reasons.append("Flexible location preference")
            
            if not reasons: reasons.append("Relevant opportunity")

            results.append({
                "job": cand,
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
                # We already have the metadata in the tuple
                ai_tasks.append(self._analyze_skill_gap_with_ai(resume_text, res["job"], res))
            if ai_tasks:
                await asyncio.gather(*ai_tasks)

        return paginated_results

    async def calculate_score(self, text: str, job: Job, user: User) -> Dict[str, Any]:
        """Solo score calculation for a specific job, consistent with find_matches logic."""
        # 1. Skill Score
        embeddings = await embedding_service.generate_embedding(text)
        resume_embedding = embeddings.tolist()
        
        import numpy as np
        job_emb = np.array(job.embedding) if job.embedding else None
        if job_emb is None:
            return {"score": 0, "missing_skills": []}
            
        # Euclidean distance to cosine similarity approximation
        dist = np.linalg.norm(np.array(resume_embedding) - job_emb)
        semantic_sim = max(0, min(100, (1.2 - dist) * 83.3))
        
        def normalize_skill(s: str) -> str:
            return s.lower().replace(".", "").replace("-", "").strip()

        user_skills = set(normalize_skill(s) for s in (user.skills or "").split(",") if s.strip())
        job_skills = [normalize_skill(s) for s in job.required_skills] if job.required_skills else []
        
        if job_skills:
            overlap = len(user_skills.intersection(set(job_skills)))
            keyword_score = (overlap / len(job_skills)) * 100
            skill_score = (semantic_sim * 0.3) + (keyword_score * 0.7) if overlap > 0 else semantic_sim * 0.8
        else:
            skill_score = semantic_sim

        # 2. Experience Score
        user_exp = user.experience_years or 0
        j_min = job.experience_min or 0
        j_max = job.experience_max or (j_min + 3)
        
        # Hard filter check
        if (user_exp <= 2 and j_min >= 5) or (j_min - user_exp >= 4):
            return {"score": 0, "missing_skills": list(set(job_skills) - user_skills), "reason": "Experience mismatch"}

        exp_score = 100
        if user_exp < j_min:
            diff = j_min - user_exp
            exp_score = max(0, 100 - (diff * 20))
            if user_exp >= 1 and j_min <= 3: exp_score = min(100, exp_score + 10)
        elif user_exp > j_max:
            over_years = user_exp - j_max
            if over_years > 2: exp_score = max(40, 100 - ((over_years - 2) * 15))

        # 3. Project Score
        project_score = self._calculate_project_score(text)

        # 4. Location Score
        user_loc = (user.location or "").lower()
        job_loc = (job.location or "").lower()
        work_type = (job.work_type or "On-site").lower()
        loc_score = 100 if work_type == "remote" or (user_loc and job_loc and (user_loc in job_loc or job_loc in user_loc)) else 40

        # Title/Designation Score
        designation_score = 100 if user.job_title and job.title and (user.job_title.lower() in job.title.lower() or job.title.lower() in user.job_title.lower()) else 60

        final_score = (skill_score * 0.4) + (exp_score * 0.4) + (project_score * 0.1) + ((loc_score * 0.5 + designation_score * 0.5) * 0.1)
        final_score = max(0, min(100, final_score))

        return {
            "score": round(final_score, 1),
            "missing_skills": list(set(job_skills) - user_skills)
        }

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
