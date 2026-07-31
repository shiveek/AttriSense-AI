from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import PredictionRequest, PredictionResponse
from backend.app.services.prediction_service import predict_employee_attrition
from backend.app.services import employee_service
from backend.app.core.auth import get_current_user, RoleChecker, User

router = APIRouter(prefix="/predict", tags=["AI Predictions"])

# Require appropriate role for AI predictions
analyst_or_above = RoleChecker(["Admin", "HR_Manager", "Analyst"])

@router.post("/", response_model=PredictionResponse)
def perform_prediction(
    request: PredictionRequest,
    current_user: User = Depends(analyst_or_above)
):
    """
    Executes real-time attrition prediction for the provided parameters.
    Requires Admin, HR_Manager, or Analyst role.
    """
    try:
        return predict_employee_attrition(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/explain/{employee_id}", response_model=PredictionResponse)
def explain_employee_prediction(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(analyst_or_above)
):
    """
    Fetches SHAP explanation factors and risk metrics for a saved employee.
    Requires Admin, HR_Manager, or Analyst role.
    """
    employee = employee_service.get_employee_by_id(db, employee_id=employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found."
        )
        
    # Reconstruct PredictionRequest fields from the database record
    req = PredictionRequest(
        age=employee.age,
        gender=employee.gender,
        marital_status=employee.marital_status,
        distance_from_home=employee.distance_from_home,
        department=employee.department,
        job_role=employee.job_role,
        job_level=employee.job_level,
        monthly_income=employee.monthly_income,
        years_at_company=employee.years_at_company,
        years_in_current_role=employee.years_in_current_role,
        years_since_last_promotion=employee.years_since_last_promotion,
        performance_rating=employee.performance_rating,
        job_satisfaction=employee.job_satisfaction,
        work_life_balance=employee.work_life_balance,
        training_hours=employee.training_hours,
        overtime=employee.overtime
    )
    
    try:
        return predict_employee_attrition(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to explain employee prediction: {str(e)}"
        )
