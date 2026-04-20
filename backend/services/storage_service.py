import os
import uuid
import logging
from fastapi import UploadFile
from supabase import create_client, Client
from core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.supabase: Client | None = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
        self.bucket_name = "resumes" 

    async def upload_file(self, file: UploadFile, generate_uuid: bool = True, content: bytes = None) -> str:
        """
        Uploads a FastAPI file to Supabase Storage or Local Storage as fallback.
        Returns the public URL of the uploaded file.
        """
        if content is None:
            content = await file.read()
        
        filename = file.filename or "uploaded_file"
        if generate_uuid:
            ext = os.path.splitext(filename)[1]
            unique_name = f"{uuid.uuid4()}{ext}"
            path_on_storage = f"{unique_name}"
        else:
            path_on_storage = filename

        # 1. Try Supabase Storage
        if self.supabase:
            try:
                # Basic validation of supabase client
                self.supabase.storage.from_(self.bucket_name).upload(
                    file=content,
                    path=path_on_storage,
                    file_options={"content-type": file.content_type}
                )
                
                # public URL retrieval
                public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(path_on_storage)
                return public_url
            except Exception as e:
                logger.error(f"Error uploading file to Supabase: {e}. Falling back to local storage.")

        # 2. Local Storage Fallback
        try:
            upload_dir = settings.UPLOAD_DIR
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir, exist_ok=True)
            
            local_path = os.path.join(upload_dir, path_on_storage)
            with open(local_path, "wb") as f:
                f.write(content)
            
            # Return path that maps to /uploads mount in main.py
            # If UPLOAD_DIR is "uploads/resumes", we want /uploads/resumes/filename
            return f"/uploads/resumes/{path_on_storage}"
            
        except Exception as e:
            logger.error(f"Error saving file locally: {e}")
            raise Exception(f"Failed to upload file to any storage: {str(e)}")
        finally:
            await file.seek(0)

storage_service = StorageService()
