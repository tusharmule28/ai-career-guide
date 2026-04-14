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

    async def upload_file(self, file: UploadFile, generate_uuid: bool = True) -> str:
        """
        Uploads a FastAPI file to Supabase Storage.
        Returns the public URL of the uploaded file.
        """
        if not self.supabase:
            logger.warning("Supabase client not configured. Cannot upload file.")
            raise Exception("Storage service is not available (Supabase potentially missing keys).")

        content = await file.read()
        
        filename = file.filename or "uploaded_file"
        if generate_uuid:
            ext = os.path.splitext(filename)[1]
            # S3/Supabase handles flat hierarchy well, but let's just make it unique
            unique_name = f"{uuid.uuid4()}{ext}"
            path_on_storage = f"{unique_name}"
        else:
            path_on_storage = filename

        try:
            self.supabase.storage.from_(self.bucket_name).upload(
                file=content,
                path=path_on_storage,
                file_options={"content-type": file.content_type}
            )
            
            # public URL retrieval
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(path_on_storage)
            return public_url
        except Exception as e:
            logger.error(f"Error uploading file to Supabase: {e}")
            raise e
        finally:
            await file.seek(0) # reset file cursor if it needs to be read again

storage_service = StorageService()
