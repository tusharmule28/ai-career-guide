from pydantic import BaseModel

class HealthCheckResponse(BaseModel):
    status: str
    environment: str
    version: str
    vector_extension: bool = False
