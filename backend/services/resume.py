import os
import uuid
import fitz  # PyMuPDF
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.resume import Resume
from core.config import settings
from services.matching_service import matching_service

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

async def save_upload_file(upload_file: UploadFile, user_id: int = None) -> dict:
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        content = await upload_file.read()
        buffer.write(content)
        
    return {
        "filename": upload_file.filename,
        "file_path": file_path,
        "unique_filename": unique_filename
    }

async def process_resume_upload(db: Session, upload_file: UploadFile, user_id: int = None) -> Resume:
    # 1. Save File
    file_info = await save_upload_file(upload_file, user_id)
    
    # 2. Extract Text
    extracted_text = extract_text_from_pdf(file_info["file_path"])
    
    # 3. Save to Database
    db_resume = Resume(
        filename=file_info["filename"],
        file_path=file_info["file_path"],
        extracted_text=extracted_text,
        user_id=user_id
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # 4. Generate Embedding for vector search
    matching_service.update_resume_embedding(db, db_resume)
    
    return db_resume
