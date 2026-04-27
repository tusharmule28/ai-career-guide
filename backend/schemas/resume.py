from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str
    user_id: Optional[int] = None

class ResumeResponse(ResumeBase):
    id: int
    file_path: Optional[str] = None
    extracted_text: Optional[str] = None
    extracted_data: Optional[dict] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
