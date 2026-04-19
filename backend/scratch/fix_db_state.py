from db.database import engine
from sqlalchemy import text

def fix_db():
    with engine.connect() as conn:
        print("--- Standardizing ApplicationStatus Enum ---")
        try:
            # 1. Add PENDING if missing
            res = conn.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'applicationstatus'"))
            labels = [r[0] for r in res.fetchall()]
            
            if 'PENDING' not in labels:
                print("Adding 'PENDING' to enum...")
                conn.execute(text("COMMIT"))
                conn.execute(text("ALTER TYPE applicationstatus ADD VALUE 'PENDING'"))
                print("Added 'PENDING'")
            
            if 'DEMO' not in labels:
                print("Adding 'DEMO' to enum...")
                conn.execute(text("COMMIT"))
                conn.execute(text("ALTER TYPE applicationstatus ADD VALUE 'DEMO'"))
                print("Added 'DEMO'")

            # 2. Convert 'Demo' to 'DEMO' in the applications table if any exist
            print("Updating 'Demo' status to 'DEMO' in applications table...")
            conn.execute(text("UPDATE applications SET status = 'DEMO' WHERE status::text = 'Demo'"))
            conn.commit()

        except Exception as e:
            print(f"Enum sync error: {e}")
            
        print("\n--- Backfilling User Trial Data ---")
        try:
            print("Setting trial_used = False for NULL records...")
            conn.execute(text("UPDATE users SET trial_used = False WHERE trial_used IS NULL"))
            
            print("Setting trial_remaining = 5 for NULL records...")
            conn.execute(text("UPDATE users SET trial_remaining = 5 WHERE trial_remaining IS NULL"))
            
            conn.commit()
            print("Backfill completed.")
        except Exception as e:
            print(f"User backfill error: {e}")

if __name__ == "__main__":
    fix_db()
