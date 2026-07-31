import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load DB URL from env, default to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attrisense.db")

# SQLAlchemy requires postgresql:// instead of postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Check if using PostgreSQL
is_postgres = DATABASE_URL.startswith("postgresql")

# Set engine arguments
engine_args = {}
if is_postgres:
    # Use connection pooling for production PostgreSQL database
    engine_args.update({
        "pool_size": 15,
        "max_overflow": 25,
        "pool_recycle": 1800,
        "pool_pre_ping": True
    })
else:
    # check_same_thread is needed only for SQLite
    engine_args.update({
        "connect_args": {"check_same_thread": False}
    })

# Create engine
engine = create_engine(DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency to get DB session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

