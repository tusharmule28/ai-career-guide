from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.application import Application, ApplicationStatus
from models.job import Job

router = APIRouter()

@router.post("/{job_id}", response_model=dict)
async def apply_to_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == job_id
    ).first()
    
    if existing:
        return {"message": "Already tracked", "id": existing.id, "status": existing.status.value}
    
    new_app = Application(user_id=current_user.id, job_id=job_id)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    return {"message": "Application tracked as Pending", "id": new_app.id, "status": "Pending"}

@router.patch("/{id}", response_model=dict)
async def update_application_status(
    id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    try:
        # Convert string to enum
        app.status = ApplicationStatus(status)
        db.commit()
        return {"message": "Status updated", "status": app.status.value}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {[s.value for s in ApplicationStatus]}")

@router.delete("/{id}", response_model=dict)
async def delete_application(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(app)
    db.commit()
    return {"message": "Application removed"}

@router.get("/", response_model=List[dict])
async def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.applied_at.desc()).all()
    
    results = []
    for app in apps:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        results.append({
            "id": app.id,
            "job_id": app.job_id,
            "status": app.status.value,
            "applied_at": app.applied_at,
            "job_title": job.title if job else "Unknown",
            "company": job.company if job else "Unknown",
            "apply_url": job.apply_url if job else "#"
        })
    
    return results
