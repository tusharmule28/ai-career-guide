from celery import Celery
from core.config import settings

def get_redis_url():
    """Construct Redis URL from env vars, prioritizing standard REDIS_URL."""
    if settings.REDIS_URL:
        # Append SSL check skip for rediss:// if not present
        url = settings.REDIS_URL
        if url.startswith("rediss://") and "ssl_cert_reqs" not in url:
            separator = "&" if "?" in url else "?"
            url += f"{separator}ssl_cert_reqs=none"
        return url
    
    # Try to construct from Upstash REST credentials
    if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(settings.UPSTASH_REDIS_REST_URL)
            hostname = parsed.hostname
            # Note: Upstash standard Redis (TCP) uses token as password
            # Explicitly adding ssl_cert_reqs=none for better stability on cloud platforms
            return f"rediss://:{settings.UPSTASH_REDIS_REST_TOKEN}@{hostname}:6379?ssl_cert_reqs=none"
        except Exception:
            pass
            
    return f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"

# Create Celery instance
celery_app = Celery(
    "worker",
    broker=get_redis_url(),
    backend=get_redis_url()
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
    # Resilience settings
    broker_connection_retry_on_startup=True,
    redis_backend_health_check_interval=30,
    result_backend_transport_options={"retry_on_timeout": True},
    broker_pool_limit=None, # Helps with connection leak issues
)

# Auto-discover tasks in the tasks directory
celery_app.autodiscover_tasks(["tasks"])
