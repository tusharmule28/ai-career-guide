from db.database import Base
from models.user import User
from models.job import Job
from models.resume import Resume
from models.match_result import MatchResult
from models.notification import Notification

# Expose models for Alembic auto-discovery
models = [User, Job, Resume, MatchResult, Notification]
