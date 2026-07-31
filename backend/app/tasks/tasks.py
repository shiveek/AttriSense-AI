import os
import logging
import pandas as pd
from celery import Celery
from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.models.db_models import Employee, AuditLog, Notification
from backend.app.ml.pipeline import train_attrition_model

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CeleryWorker")

# Initialize Celery app
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("attrisense_tasks", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="tasks.retrain_model")
def retrain_model_task():
    """
    Asynchronous task to retrain the attrition prediction Random Forest model
    using combined dataset (base dataset + database updates).
    """
    logger.info("Initializing background model retraining...")
    db = SessionLocal()
    try:
        # 1. Fetch current employees in database
        employees = db.query(Employee).all()
        logger.info(f"Retrieved {len(employees)} records from database for retraining.")
        
        db_records = []
        for emp in employees:
            attrition_val = "Yes" if emp.status == "Terminated" else "No"
            db_records.append({
                "EmployeeID": emp.id,
                "Age": emp.age,
                "Gender": emp.gender,
                "MaritalStatus": emp.marital_status,
                "DistanceFromHome": emp.distance_from_home,
                "Department": emp.department,
                "JobRole": emp.job_role,
                "JobLevel": emp.job_level,
                "MonthlyIncome": emp.monthly_income,
                "YearsAtCompany": emp.years_at_company,
                "YearsInCurrentRole": emp.years_in_current_role,
                "YearsSinceLastPromotion": emp.years_since_last_promotion,
                "PerformanceRating": emp.performance_rating,
                "JobSatisfaction": emp.job_satisfaction,
                "WorkLifeBalance": emp.work_life_balance,
                "TrainingHours": emp.training_hours,
                "Overtime": emp.overtime,
                "Attrition": attrition_val
            })
            
        db_df = pd.DataFrame(db_records)
        
        # 2. Merge with original base dataset to preserve sample count
        base_csv = "dataset/employee_attrition.csv"
        if os.path.exists(base_csv):
            base_df = pd.read_csv(base_csv)
            # Concat and drop duplicates, keeping db_df values
            combined_df = pd.concat([db_df, base_df]).drop_duplicates(subset=["EmployeeID"], keep="first")
            logger.info(f"Merged database updates with base dataset. Total training rows: {len(combined_df)}")
        else:
            combined_df = db_df
            logger.info(f"Base dataset not found. Training on DB records only. Total rows: {len(combined_df)}")
            
        # 3. Save to a temporary training path
        os.makedirs("dataset", exist_ok=True)
        train_csv = "dataset/employee_attrition_train.csv"
        combined_df.to_csv(train_csv, index=False)
        
        # 4. Run pipeline training
        train_attrition_model(train_csv, "model")
        logger.info("Random Forest retraining completed successfully.")
        
        # 5. Clear prediction service model cache to trigger reload
        from backend.app.services.prediction_service import clear_model_cache
        clear_model_cache()
        logger.info("Cleared model cache in prediction_service.")
        
        # 6. Log success in Audit Log
        audit_log = AuditLog(
            action="MODEL_RETRAINED",
            details=f"Model retrained successfully with {len(combined_df)} records. Cache reloaded."
        )
        db.add(audit_log)
        
        # 7. Create in-app system notification for Admin
        admin_notification = Notification(
            user_id=1, # Admin is ID 1
            title="Model Retrained Successfully",
            message=f"ML Pipeline has been updated. Trained samples: {len(combined_df)}.",
            type="success"
        )
        db.add(admin_notification)
        db.commit()
        
        return {
            "status": "success",
            "samples_trained": len(combined_df),
            "message": "Model retrained and cached updated."
        }
    except Exception as e:
        logger.error(f"Retraining task failed: {str(e)}")
        audit_log = AuditLog(
            action="MODEL_RETRAIN_FAILED",
            details=f"Retraining failed: {str(e)}"
        )
        db.add(audit_log)
        db.commit()
        raise e
    finally:
        db.close()
