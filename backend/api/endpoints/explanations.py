from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.resume import Resume
from models.job import Job
from schemas.explanation import ExplanationRequest, ExplanationResponse
from services.explanation import get_match_explanation, get_improvement_suggestions
from services.application_assistant import application_assistant
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/explain", response_model=ExplanationResponse)
async def explain_match(request: ExplanationRequest):
    """
    Generate an explanation of why a resume matches a job description and suggest skill improvements.
    
    Requires HUGGING_FACE_API_TOKEN to be set in environment variables.
    """
    try:
        match_reason = await get_match_explanation(request.resume_text, request.job_description)
        improvement_plan = await get_improvement_suggestions(request.missing_skills)
        
        return {
            "match_reason": match_reason,
            "improvement_plan": improvement_plan
        }
    except Exception as e:
        logger.error(f"Explanation generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Service is currently busy or rate-limited. Please try again in 1 minute."
        )

@router.get("/{job_id}", response_model=dict)
async def get_explanation(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate match explanation and improvement suggestions for a specific job and the current user's latest resume.
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
        match_reason = await get_match_explanation(resume.extracted_text, job.description)
        # We also need missing skills for the improvement suggestions
        # For simplicity, we'll just return the match raison here as required by the frontend
        
        return {
            "explanation": match_reason,
            "job_title": job.title
        }
    except Exception as e:
        logger.error(f"Explanation fetch failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Service is currently busy or rate-limited. Please try again in 1 minute."
        )


@router.post("/cover-letter/{job_id}", response_model=dict)
async def generate_cover_letter(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a tailored AI cover letter and pre-fill form data for a specific job,
    using the user's latest resume and profile.
    """
    # 1. Get latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    resume_text = resume.extracted_text if resume and resume.extracted_text else ""

    # 2. Get job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if not resume_text and not (current_user.bio or current_user.skills):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a resume or update your profile bio/skills before generating a cover letter."
        )

    try:
        result = await application_assistant.generate_application_package(
            user=current_user,
            job_title=job.title,
            job_description=job.description,
            resume_text=resume_text
        )
        if "error" in result:
            raise HTTPException(status_code=503, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Service is currently busy. Please try again in 1 minute."
        )
