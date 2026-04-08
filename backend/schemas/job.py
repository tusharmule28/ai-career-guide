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
    work_type: Optional[str] = "On-site"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    posted_at: datetime
    
    @property
    def salary_range(self) -> Optional[str]:
        if self.salary_min and self.salary_max:
            return f"${self.salary_min/1000}k - ${self.salary_max/1000}k"
        elif self.salary_min:
            return f"From ${self.salary_min/1000}k"
        return "Competitive"
        
    @property
    def experience_level(self) -> str:
        if self.experience_min is None:
            return "Entry" # Default or maybe analyze description
        if self.experience_min == 0:
            return "Entry"
        elif 1 <= self.experience_min <= 3:
            return "Mid"
        elif 4 <= self.experience_min <= 7:
            return "Senior"
        else:
            return "Lead"

    class Config:
        from_attributes = True
