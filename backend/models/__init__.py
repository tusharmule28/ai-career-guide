from db.database import Base
from models.user import User
from models.job import Job
from models.resume import Resume

# Expose models for Alembic auto-discovery
models = [User, Job, Resume]
