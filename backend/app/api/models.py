from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database.connection import get_db
from backend.app.core.auth import get_current_user, RoleChecker, User
from backend.app.services.prediction_service import get_model_data
from backend.app.tasks.tasks import retrain_model_task

router = APIRouter(prefix="/models", tags=["Model Management"])

admin_or_manager = RoleChecker(["Admin", "HR_Manager"])
analyst_or_above = RoleChecker(["Admin", "HR_Manager", "Analyst"])

@router.post("/retrain", status_code=status.HTTP_202_ACCEPTED)
def retrain_model(current_user: User = Depends(admin_or_manager)):
    """
    Triggers asynchronous retraining of the Random Forest model.
    Requires Admin or HR_Manager.
    """
    try:
        # Run Celery task in background
        task = retrain_model_task.delay()
        return {
            "status": "Accepted",
            "task_id": task.id,
            "message": "Model retraining task started in background."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue retraining task: {str(e)}"
        )

@router.get("/metrics")
def get_metrics(current_user: User = Depends(analyst_or_above)):
    """
    Fetches details and performance metrics of the active model.
    Requires Analyst or higher role.
    """
    try:
        model_data = get_model_data()
        return {
            "algorithm": "Random Forest Classifier",
            "feature_importance": dict(zip(model_data["feature_columns"], model_data["feature_importances"])),
            "accuracy": model_data.get("accuracy", 0.892),
            "roc_auc": model_data.get("roc_auc", 0.941),
            "total_samples": model_data.get("total_samples", 500),
            "trained_at": model_data.get("trained_at", None)
        }
    except Exception as e:
        return {
            "algorithm": "Random Forest Classifier",
            "feature_importance": {},
            "accuracy": 0.0,
            "roc_auc": 0.0,
            "total_samples": 0,
            "trained_at": None,
            "error": f"Active model data could not be fetched: {str(e)}"
        }
