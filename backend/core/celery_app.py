from celery import Celery
from core.config import settings

# Create Celery instance
celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL or f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=settings.REDIS_URL or f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600, # 1 hour
)

# Auto-discover tasks in the tasks directory
celery_app.autodiscover_tasks(["tasks"])
