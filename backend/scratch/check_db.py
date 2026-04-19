from db.database import engine
from sqlalchemy import text

if __name__ == "__main__":
    with engine.connect() as conn:
        print("--- Tables ---")
        res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        for row in res:
            print(f"Table: {row[0]}")
            
        print("\n--- Users Table Columns ---")
        res = conn.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users'"))
        for row in res:
            print(f"Column: {row[0]}, Type: {row[1]}, Nullable: {row[2]}")
            
        print("\n--- ApplicationStatus Enum Labels ---")
        try:
            res = conn.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'applicationstatus'"))
            for row in res:
                print(f"Enum Value: {row[0]}")
        except Exception as e:
            print("Error checking enum:", e)
            
        print("\n--- Sample User ---")
        res = conn.execute(text("SELECT id, email, is_premium, trial_used, trial_remaining FROM users LIMIT 1"))
        for row in res:
            print(f"User: {row}")
