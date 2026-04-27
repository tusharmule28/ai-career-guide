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
        Uploads a file with priority: Supabase Storage -> Local Storage.
        Returns the public URL or path of the uploaded file.
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

        # 1. Try Supabase Storage (Always Free 1GB)
        if self.supabase:
            try:
                # Check if bucket exists, if not, it might fail, 
                # but usually we pre-create it in Supabase dashboard.
                self.supabase.storage.from_(self.bucket_name).upload(
                    file=content,
                    path=path_on_storage,
                    file_options={"content-type": file.content_type or 'application/pdf'}
                )
                public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(path_on_storage)
                logger.info(f"Successfully uploaded to Supabase: {public_url}")
                return public_url
            except Exception as e:
                logger.error(f"Error uploading to Supabase: {e}. Falling back to local...")

        # 2. Local Storage Fallback (Ephemeral in Cloud)
        try:
            upload_dir = os.path.join(settings.UPLOAD_DIR)
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir, exist_ok=True)
            
            local_path = os.path.join(upload_dir, path_on_storage)
            with open(local_path, "wb") as f:
                f.write(content)
            
            logger.warning(f"Saved file locally at {local_path}. This will not persist in cloud restarts.")
            return f"/uploads/resumes/{path_on_storage}"
            
        except Exception as e:
            logger.error(f"Error saving file locally: {e}")
            raise Exception(f"Failed to upload file to any storage: {str(e)}")
        finally:
            await file.seek(0)

storage_service = StorageService()
