import sys
import os
sys.path.append(os.path.join(os.getcwd()))

from db.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    with db.begin():
        db.execute(text("""
            DELETE FROM jobs
            WHERE external_id IS NOT NULL 
            AND id NOT IN (
                SELECT MIN(id)
                FROM jobs
                WHERE external_id IS NOT NULL
                GROUP BY external_id
            );
        """))
    print("Deduplicated jobs based on external_id successfully.")
except Exception as e:
    print(f"Error deduplicating jobs: {e}")
finally:
    db.close()
