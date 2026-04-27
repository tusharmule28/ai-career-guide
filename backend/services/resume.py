import os
import gc
import fitz  # PyMuPDF
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.resume import Resume
from services.storage_service import storage_service
from services.profile_service import profile_service
from tasks.job_tasks import recalculate_user_matches

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    text = ""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

async def parse_resume_to_data(file_bytes: bytes) -> dict:
    """Standalone parser for Lambda usage."""
    text = extract_text_from_pdf_bytes(file_bytes)
    data = await profile_service.extract_profile_from_text(text)
    return {"text": text, "data": data}

from models.user import User

async def process_resume_upload(db: Session, upload_file: UploadFile, user_id: int = None) -> Resume:
    # 1. Read file bytes
    content = await upload_file.read()
    
    # 2. Parse (can be moved to Lambda)
    parsed = await parse_resume_to_data(content)
    extracted_text = parsed["text"]
    extracted_data = parsed["data"]
    
    # 4. Upload to Storage
    # Reset seek so storage_service can read it if needed, 
    # though it's better if storage_service takes bytes.
    # For now, keeping UploadFile interface but seeking to 0.
    await upload_file.seek(0)
    file_url = await storage_service.upload_file(upload_file, generate_uuid=True, content=content)
    
    # 4. Save Resume to Database
    db_resume = Resume(
        filename=upload_file.filename,
        file_url=file_url,
        extracted_text=extracted_text,
        extracted_data=extracted_data,
        user_id=user_id
    )
    db.add(db_resume)
    db.flush() # Get ID without committing yet
    
    # 5. Update User's active resume_id
    if user_id:
        update_data = {"resume_id": db_resume.id}
        if extracted_data:
            if extracted_data.get("job_title"): update_data["job_title"] = extracted_data["job_title"]
            if extracted_data.get("skills"): update_data["skills"] = ",".join(extracted_data["skills"])
            if extracted_data.get("experience_years"): update_data["experience_years"] = extracted_data["experience_years"]
            if extracted_data.get("summary") and not getattr(db.query(User).get(user_id), 'bio', None):
                 update_data["bio"] = extracted_data["summary"]
                 
        db.query(User).filter(User.id == user_id).update(update_data)
    
    db.commit()
    db.refresh(db_resume)
    
    # 6. Dispatch Celery event for embeddings recalculation
    recalculate_user_matches.delay(db_resume.id)
    
    # Cleanup
    del content
    del extracted_text
    gc.collect()
    
    return db_resume
