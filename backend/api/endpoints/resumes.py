from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from db.database import get_db
from schemas.resume import ResumeResponse
from services.resume import process_resume_upload
from models.resume import Resume
from core.security import get_current_user
from services.gap_analyzer import gap_analyzer
from models.user import User

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
        
    try:
        resume = await process_resume_upload(db=db, upload_file=file, user_id=current_user.id)
        return resume
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the upload: {str(e)}"
        )

@router.get("/gap-analysis")
async def get_resume_gap_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Perform a deep AI gap analysis on the user's current resume and profile.
    """
    # 1. Get latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    
    resume_text = resume.extracted_text if resume else ""
    profile_text = f"{current_user.job_title or ''} {current_user.bio or ''} {current_user.skills or ''}"
    
    if not resume_text and not profile_text.strip():
        raise HTTPException(status_code=400, detail="Please upload a resume or update your profile to analyze gaps.")
        
    analysis = await gap_analyzer.analyze_resume_gap(resume_text, profile_text)
    return analysis
