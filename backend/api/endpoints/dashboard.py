from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.job import Job
from models.resume import Resume
from services.matching_service import matching_service

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get summary statistics and recent activities for the user dashboard.
    """
    # 1. Get user's latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    
    match_count = 0
    avg_score = 0
    
    if resume and resume.embedding:
        # Find matches with >50% similarity
        # Similarity = 1 - Distance
        # 0.50 similarity = 0.50 distance
        matches = await matching_service.find_matches(db, resume.extracted_text, top_n=50)
        high_matches = [m for m in matches if m["score"] >= 50]
        match_count = len(high_matches)
        
        if matches:
            avg_score = sum(m["score"] for m in matches[:5]) / min(len(matches), 5)
            
    # 2. Get recent sessions/activities
    # For now, we'll list resume uploads as activities
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).limit(5).all()
    activities = []
    for r in resumes:
        activities.append({
            "id": r.id,
            "title": "Resume analyzed",
            "status": "completed",
            "time": r.uploaded_at.strftime("%Y-%m-%d %H:%M")
        })
        
    # 3. Recommendations (Dynamic Tips)
    recommendations = [
        {
            "category": "Resume Tip",
            "text": "Your resume text has been successfully extracted. Consider quantifying your achievements to reach 90%+ match scores."
        }
    ]
    
    if match_count > 0:
        recommendations.append({
            "category": "Skill Insight",
            "text": f"You are a high match for {match_count} roles. Check the Skill Gap analyzer to boost your chances."
        })
    else:
        recommendations.append({
            "category": "Market Insight",
            "text": "The market is currently listing several roles in your field. Upload a resume to see matching scores."
        })
        
    return {
        "match_count": match_count,
        "skill_score": round(avg_score, 1),
        "application_count": 0,
        "activities": activities,
        "recommendations": recommendations[:3]
    }
