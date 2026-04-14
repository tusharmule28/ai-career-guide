import time
import sys
import os
from sqlalchemy import text

# Add backend to path
sys.path.append(os.getcwd())

from db.database import engine, SessionLocal
from core.config import settings

def test_connection():
    print(f"[*] Testing connection to: {settings.DATABASE_URL.split('@')[-1]}")
    
    start_time = time.time()
    try:
        with engine.connect() as conn:
            conn_time = time.time()
            print(f"[+] Connection established in {conn_time - start_time:.4f} seconds.")
            
            # Simple query test
            query_start = time.time()
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            query_end = time.time()
            print(f"[+] Query executed in {query_end - query_start:.4f} seconds.")
            print(f"[+] Database version: {version}")
            
            # Test table access
            table_start = time.time()
            result = conn.execute(text("SELECT count(*) FROM users;"))
            count = result.fetchone()[0]
            table_end = time.time()
            print(f"[+] User count: {count} (Fetched in {table_end - table_start:.4f} seconds)")
            
    except Exception as e:
        print(f"[!] Connection failed: {e}")
        return False
    
    total_time = time.time() - start_time
    print(f"[*] Total test time: {total_time:.4f} seconds.")
    return True

if __name__ == "__main__":
    if test_connection():
        print("\n[SUCCESS] Connection and performance look good!")
    else:
        print("\n[FAILURE] Connection issues detected.")
        sys.exit(1)
