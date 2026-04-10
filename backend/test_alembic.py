import sys
import alembic.config
import traceback

def test():
    try:
        alembic_args = ["-c", "alembic.ini", "upgrade", "head"]
        alembic.config.main(argv=alembic_args)
        print("Success without exit")
    except Exception as e:
        print("Exception:", e)
    except BaseException as e:
        print("BaseException:", repr(e))

if __name__ == "__main__":
    test()
