from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: str
    required_skills: List[str]
    apply_url: str
    source: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    posted_at: datetime

    class Config:
        from_attributes = True
