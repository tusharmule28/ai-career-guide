from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.resume import Resume
from models.job import Job
from schemas.skill_gap import SkillGapRequest, SkillGapResponse
from services.skill_gap import analyze_skill_gap

router = APIRouter()

@router.post("/analyze-gap", response_model=SkillGapResponse)
async def analyze_gap(request: SkillGapRequest):
    """
    Compare resume text with job description and return extracted skills and missing skills.
    
    Requires HUGGING_FACE_API_TOKEN to be set in environment variables.
    """
    try:
        result = await analyze_skill_gap(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during skill gap analysis: {str(e)}"
        )

@router.get("/gap/{job_id}", response_model=SkillGapResponse)
async def get_skill_gap(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get skill gap for the current user's latest resume against a specific job.
    """
    # 1. Get latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    
    if not resume or not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found or resume text extraction failed."
        )
        
    # 2. Get job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
        
    try:
        # 3. Analyze
        # Note: analyze_skill_gap might take a while, consider caching or background task in production
        result = await analyze_skill_gap(resume.extracted_text, job.description)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during skill gap analysis: {str(e)}"
        )
