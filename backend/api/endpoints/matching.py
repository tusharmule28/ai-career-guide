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
    top_n: int = 5
    sort_newest: bool = True

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
    # Trigger background job fetch to ensure fresh data for NEXT time or later
    background_tasks.add_task(job_fetcher.sync_jobs, db)

    resume_id = request.resume_id
    top_n = request.top_n
    sort_newest = request.sort_newest

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
            profile_context = f"{user.job_title or ''} {user.bio or ''} {user.skills or ''}"
    
    # Combine context
    combined_text = f"{profile_context} {resume_text}".strip()

    if not combined_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume or profile info found to match. Please update your profile or upload a resume."
        )
        
    try:
        # If sorting by newest, we fetch more similar jobs and then re-sort by date
        fetch_n = 20 if sort_newest else top_n
        matches = await matching_service.find_matches(db, combined_text, fetch_n)
        
        # Format for response
        response_data = []
        for match in matches:
            job = match["job"]
            response_data.append({
                "job_id": job.id,
                "title": job.title,
                "company": job.company,
                "score": match["score"],
                "found_skills": match.get("found_skills", []),
                "missing_skills": match.get("missing_skills", []),
                "description": job.description,
                "location": job.location,
                "required_skills": job.required_skills,
                "apply_url": job.apply_url,
                "source": job.source,
                "posted_at": job.posted_at
            })
        
        # Sort by newest if requested
        if sort_newest:
            response_data.sort(key=lambda x: x["posted_at"] or "", reverse=True)
            # Limit back to top_n
            response_data = response_data[:top_n]
            
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
        matches = await matching_service.find_matches(db, resume_text, top_n)
        
        # Format for response
        response_data = []
        for match in matches:
            job = match["job"]
            response_data.append({
                "job_id": job.id,
                "title": job.title,
                "company": job.company,
                "score": match["score"],
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
