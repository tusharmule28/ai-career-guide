"""
Apply with AI endpoint — uses the LangGraph 4-agent pipeline.
Premium gating: free users get 3 credits, premium users have unlimited access.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.job import Job
from models.resume import Resume
from services.agents.workflow import run_apply_with_ai

router = APIRouter()


class ApplyWithAIRequest(BaseModel):
    job_id: int


class ApplyWithAIResponse(BaseModel):
    match_score: int
    match_rationale: str
    missing_skills: list[str]
    matched_skills: list[str]
    cover_letter: str
    top_skills_to_highlight: list[str]
    pre_fill_data: dict
    credits_remaining: int


@router.post("/apply-with-ai", response_model=ApplyWithAIResponse)
async def apply_with_ai(
    request: ApplyWithAIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Invoke the 4-step LangGraph agent (Matcher → Gap → Draft → ApplyAssist).
    Consumes 1 AI credit per call for free users.
    """
    # ── Premium / credit gate ──────────────────────────────────────────────
    if not current_user.is_premium:
        if (current_user.ai_credits or 0) <= 0:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "You've used all your free Apply-with-AI credits.",
                    "upgrade_prompt": "Upgrade to Premium for unlimited access.",
                },
            )

    # ── Fetch job ───────────────────────────────────────────────────────────
    job = db.query(Job).filter(Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    # ── Fetch latest resume ─────────────────────────────────────────────────
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    resume_text = resume.extracted_text if resume else ""

    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume before using Apply with AI.",
        )

    # ── Run agent pipeline ──────────────────────────────────────────────────
    result = await run_apply_with_ai(
        job_title=job.title,
        job_description=job.description,
        job_requirements=", ".join(job.required_skills) if isinstance(job.required_skills, list) else str(job.required_skills or ""),
        resume_text=resume_text,
        user_name=current_user.name or "Candidate",
        user_email=current_user.email,
        user_bio=current_user.bio or "",
        user_skills=current_user.skills or "",
    )

    # ── Deduct credit for free users ────────────────────────────────────────
    if not current_user.is_premium:
        current_user.ai_credits = max(0, (current_user.ai_credits or 1) - 1)
        db.commit()

    credits_remaining = -1 if current_user.is_premium else (current_user.ai_credits or 0)

    return ApplyWithAIResponse(
        match_score=result.get("match_score") or 0,
        match_rationale=result.get("match_rationale") or "",
        missing_skills=result.get("missing_skills") or [],
        matched_skills=result.get("matched_skills") or [],
        cover_letter=result.get("cover_letter") or "",
        top_skills_to_highlight=result.get("top_skills_to_highlight") or [],
        pre_fill_data=result.get("pre_fill_data") or {},
        credits_remaining=credits_remaining,
    )
