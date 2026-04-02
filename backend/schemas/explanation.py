from pydantic import BaseModel
from typing import List, Optional

class ExplanationRequest(BaseModel):
    resume_text: str
    job_description: str
    missing_skills: Optional[List[str]] = None

class ExplanationResponse(BaseModel):
    match_reason: str
    improvement_plan: str
