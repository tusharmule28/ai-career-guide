from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from db.database import get_db
from schemas.job import JobResponse
from services.matching_service import matching_service
from models.resume import Resume
from core.security import get_current_user
from models.user import User
from scrapers.job_fetcher import job_fetcher

router = APIRouter()

from pydantic import BaseModel
class MatchRequest(BaseModel):
    resume_id: Optional[int] = None
    top_n: int = 10
    skip: int = 0
    sort_newest: bool = False # Weighted scoring handles relevance, but this can be a tie-breaker
    min_score: float = 0.0
    recent_only: bool = False
    force_sync: bool = False # Explicitly trigger a fresh scrape

@router.post("/match", response_model=List[dict])
async def match_resume_to_jobs(
    background_tasks: BackgroundTasks,
    request: MatchRequest = MatchRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Match a resume + profile against all available jobs.
    If resume_id is not provided, uses the current user's latest resume.
    """
    # Trigger background job fetch to ensure fresh data
    background_tasks.add_task(job_fetcher.sync_jobs, db, force_sync=request.force_sync)

    resume_id = request.resume_id
    top_n = request.top_n
    sort_newest = request.sort_newest
    min_score = request.min_score
    recent_only = request.recent_only

    # 1. Get Resume
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
    else:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()

    resume_text = resume.extracted_text if resume and resume.extracted_text else ""
    
    # 2. Get Profile Info to enrich the context
    profile_context = ""
    if current_user:
        # Fetch fresh from DB to get latest
        user = db.query(User).filter(User.id == current_user.id).first()
        if user:
            exp_str = f"{user.experience_years} years experience" if user.experience_years else ""
            profile_context = " ".join(filter(None, [
                user.job_title,
                user.bio,
                user.skills,
                user.location,
                exp_str,
            ]))
    
    # Combine context
    combined_text = f"{profile_context} {resume_text}".strip()

    if not combined_text:
        # Return empty list instead of 400 for better UX on new accounts
        return []
        
    try:
        # Fetch matches using the new weighted logic
        matches = await matching_service.find_matches(
            db, 
            current_user, 
            combined_text, 
            top_n=request.top_n, 
            skip=request.skip
        )
        
        # Format for response
        response_data = []
        for match in matches:
            job = match["job"]
            response_data.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "score": match["score"],
                "match_reason": match.get("match_reason", "Candidate Profile Match"),
                "all_reasons": match.get("all_reasons", []),
                "found_skills": match.get("found_skills", []),
                "missing_skills": match.get("missing_skills", []),
                "description": job.description,
                "location": job.location,
                "required_skills": job.required_skills,
                "apply_url": job.apply_url,
                "source": job.source,
                "posted_at": job.posted_at,
                "work_type": job.work_type
            })
        
        # Apply strict filters if requested (though weighted scoring usually handles this)
        if min_score > 0:
            response_data = [m for m in response_data if m["score"] >= min_score]
            
        if recent_only:
            from datetime import datetime, timedelta, timezone
            now = datetime.now(timezone.utc)
            twenty_four_hours_ago = now - timedelta(hours=24)
            response_data = [m for m in response_data if m["posted_at"] and m["posted_at"].replace(tzinfo=timezone.utc) >= twenty_four_hours_ago]
            
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during matching: {str(e)}"
        )

@router.post("/match-text", response_model=List[dict])
async def match_text_to_jobs(
    resume_text: str,
    top_n: int = 5,
    db: Session = Depends(get_db)
):
    """
    Match raw resume text against all available jobs.
    """
    try:
        # For anonymous text matching, we use a ghost user or just neutral profile
        ghost_user = User(skills="", location="", experience_years=0)
        matches = await matching_service.find_matches(db, ghost_user, resume_text, top_n)
        
        # Format for response
        response_data = []
        for match in matches:
            job = match["job"]
            response_data.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "score": match["score"],
                "match_reason": match.get("match_reason", ""),
                "description": job.description,
                "location": job.location,
                "required_skills": job.required_skills
            })
            
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during matching: {str(e)}"
        )
