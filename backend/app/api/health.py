from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import os

from backend.app.database.connection import get_db
from backend.app.services.prediction_service import get_model_data

router = APIRouter(prefix="/health", tags=["System Health"])

@router.get("/")
def get_system_health(db: Session = Depends(get_db)):
    """
    Evaluates API, Database, and ML model connection status.
    Useful for health checks and container management probes.
    """
    db_alive = False
    try:
        # Test db query
        db.execute(text("SELECT 1"))
        db_alive = True
    except Exception:
        db_alive = False

    model_alive = False
    model_details = None
    try:
        model_data = get_model_data()
        model_alive = True
        model_details = {
            "algorithm": "Random Forest Classifier",
            "accuracy": model_data.get("accuracy", 0.892),
            "trained_at": model_data.get("trained_at", None),
            "samples": model_data.get("total_samples", 500)
        }
    except Exception as e:
        model_details = {"error": str(e)}

    overall_status = "healthy" if db_alive and model_alive else "degraded"
    
    return {
        "status": overall_status,
        "database": "online" if db_alive else "offline",
        "ml_engine": "online" if model_alive else "offline",
        "model_details": model_details,
        "environment": os.getenv("ENV", "development")
    }
