import os
import gc
import fitz  # PyMuPDF
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.resume import Resume
from services.storage_service import storage_service
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

from models.user import User

async def process_resume_upload(db: Session, upload_file: UploadFile, user_id: int = None) -> Resume:
    # 1. Read file bytes once
    content = await upload_file.read()
    
    # 2. Extract Text in-memory
    extracted_text = extract_text_from_pdf_bytes(content)
    
    # 3. Upload to Storage (Cloud or Local Fallback)
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
        user_id=user_id
    )
    db.add(db_resume)
    db.flush() # Get ID without committing yet
    
    # 5. Update User's active resume_id
    if user_id:
        db.query(User).filter(User.id == user_id).update({"resume_id": db_resume.id})
    
    db.commit()
    db.refresh(db_resume)
    
    # 6. Dispatch Celery event for embeddings recalculation
    recalculate_user_matches.delay(db_resume.id)
    
    # Cleanup
    del content
    del extracted_text
    gc.collect()
    
    return db_resume
