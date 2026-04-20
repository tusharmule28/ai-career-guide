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
        matches = await matching_service.find_matches(db, current_user, resume.extracted_text, top_n=50)
        high_matches = [m for m in matches if m["score"] >= 50]
        match_count = len(high_matches)
        
        if matches:
            avg_score = sum(m["score"] for m in matches[:5]) / min(len(matches), 5)

    # 1b. Real application count from DB
    from models.application import Application
    application_count = db.query(Application).filter(Application.user_id == current_user.id).count()
            
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
        "avg_score": round(avg_score, 1),
        "skill_score": round(avg_score, 1), # Alias for synergy score
        "application_count": application_count,
        "activities": activities,
        "recommendations": recommendations,
        "has_resume": resume is not None,
        "resume_name": resume.filename if resume else None
    }

@router.get("/skill-gap")
async def get_skill_gap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Detailed skill gap analysis comparing user profile against top matches.
    """
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    
    if not resume or not resume.embedding:
        return {
            "top_skills": [],
            "missing_skills": [],
            "match_score": 0,
            "message": "Upload a resume to initialize skill gap analysis."
        }
    
    # 1. Get matches
    matches = await matching_service.find_matches(db, current_user, resume.extracted_text, top_n=3)
    
    if not matches:
        return {
            "top_skills": [],
            "missing_skills": [],
            "match_score": 0,
            "message": "No matches found yet. Try narrowing your career profile."
        }

    # 2. Extract found and missing skills across top 3
    found_all = []
    missing_all = []
    scores = []
    
    for m in matches:
        found_all.extend(m.get("found_skills", []))
        missing_all.extend(m.get("missing_skills", []))
        scores.append(m.get("score", 0))
    
    # Deduplicate and count frequency if possible, but for now just list
    return {
        "top_skills": list(set(found_all))[:10],
        "missing_skills": list(set(missing_all))[:10],
        "match_score": round(sum(scores) / len(scores), 1) if scores else 0,
    }
