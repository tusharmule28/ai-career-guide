import asyncio
import functools
import logging
import random
import re
from typing import Callable, Any, Tuple, Optional

logger = logging.getLogger(__name__)

def parse_experience(text: str) -> Tuple[int, Optional[int]]:
    """
    Extract experience years (min, max) from text using regex.
    Example: '3-5 years', 'at least 3 years', 'min 5 years'.
    """
    if not text:
        return 0, None
    
    # Clean text to normalize whitespace and common characters
    text = text.lower().replace(',', '').replace('\n', ' ')
    
    # Regex patterns for common experience mentions
    patterns = [
        r'(\d+)\s*-\s*(\d+)\s*year',
        r'(\d+)\s*to\s*(\d+)\s*year',
        r'(\d+)\s*\+\s*year',
        r'min(?:imum)?\s*(\d+)\s*year',
        r'(?:at least|minimum of)\s*(\d+)\s*year',
        r'(\d+)\s*year(?:s)?(?:\s+of)?\s+experience',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            groups = [g for g in match.groups() if g is not None]
            if len(groups) == 2:
                return int(groups[0]), int(groups[1])
            elif len(groups) == 1:
                return int(groups[0]), None
                
    return 0, None

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
