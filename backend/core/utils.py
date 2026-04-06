import asyncio
import functools
import logging
import random
from typing import Callable, Any

logger = logging.getLogger(__name__)

def retry_with_backoff(
    retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    jitter: bool = True
):
    """
    Decorator for retrying async functions with exponential backoff.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for i in range(retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if i == retries:
                        logger.error(f"Function '{func.__name__}' failed after {retries} retries. Final error: {str(e)}")
                        break
                        
                    # Calculate wait time
                    wait = delay * (backoff_factor ** i)
                    if jitter:
                        wait += random.uniform(0, 0.1 * wait)
                    
                    logger.warning(
                        f"Retrying '{func.__name__}' in {wait:.2f}s due to error: {str(e)[:100]} "
                        f"(Attempt {i+1}/{retries})"
                    )
                    
                    await asyncio.sleep(wait)
            
            raise last_exception
            
        return wrapper
    return decorator
