from pydantic import BaseModel
from typing import List

class SkillGapRequest(BaseModel):
    resume_text: str
    job_description: str

class SkillGapResponse(BaseModel):
    resume_skills: List[str]
    job_skills: List[str]
    missing_skills: List[str]
