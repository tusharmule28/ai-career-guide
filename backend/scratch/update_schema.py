import sys
import os
import logging

# Ensure we're in the right directory context
root_path = os.getcwd()
backend_path = os.path.join(root_path, "backend")
sys.path.append(backend_path)

# Load .env before importing anything that uses settings
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_path, ".env"))

from sqlalchemy import text
from db.database import SessionLocal, engine

def run_migration():
    print("[*] Running manual schema update...")
    try:
        with engine.connect() as conn:
            # 1. Update users table
            print("[*] Adding resume_id to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_id INTEGER REFERENCES resumes(id);"))
            
            # 2. Update applications table
            print("[*] Adding resume_id to applications...")
            conn.execute(text("ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_id INTEGER REFERENCES resumes(id);"))
            
            conn.commit()
            print("[+] Schema update completed successfully.")
    except Exception as e:
        print(f"[!] Error during migration: {e}")

if __name__ == "__main__":
    run_migration()
