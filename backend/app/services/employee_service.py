from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Dict, Any
from datetime import datetime
import csv
import io

from backend.app.models.db_models import Employee, PredictionHistory
from backend.app.schemas.schemas import EmployeeCreate, EmployeeUpdate, PredictionRequest
from backend.app.services.prediction_service import predict_employee_attrition

def get_employees(
    db: Session,
    search: Optional[str] = None,
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Employee]:
    """
    Retrieves and filters employees from the database.
    """
    query = db.query(Employee)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Employee.name.like(search_filter),
                Employee.id.like(search_filter),
                Employee.email.like(search_filter)
            )
        )
        
    if department and department != "All":
        query = query.filter(Employee.department == department)
        
    if risk_level and risk_level != "All":
        query = query.filter(Employee.risk_level == risk_level)
        
    if status and status != "All":
        query = query.filter(Employee.status == status)
        
    return query.offset(skip).limit(limit).all()

def get_employee_count(
    db: Session,
    search: Optional[str] = None,
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None
) -> int:
    """
    Returns total count of matching employees.
    """
    query = db.query(Employee)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Employee.name.like(search_filter),
                Employee.id.like(search_filter),
                Employee.email.like(search_filter)
            )
        )
    if department and department != "All":
        query = query.filter(Employee.department == department)
    if risk_level and risk_level != "All":
        query = query.filter(Employee.risk_level == risk_level)
    if status and status != "All":
        query = query.filter(Employee.status == status)
        
    return query.count()

def get_employee_by_id(db: Session, employee_id: str) -> Optional[Employee]:
    """
    Retrieves a single employee by their unique ID.
    """
    return db.query(Employee).filter(Employee.id == employee_id).first()

def create_employee(db: Session, emp_create: EmployeeCreate) -> Employee:
    """
    Creates an employee, runs the predictive ML model, saves database record,
    and updates prediction history logs.
    """
    # 1. Run prediction using our pipeline
    pred_req = PredictionRequest(
        age=emp_create.age,
        gender=emp_create.gender,
        marital_status=emp_create.marital_status,
        distance_from_home=emp_create.distance_from_home,
        department=emp_create.department,
        job_role=emp_create.job_role,
        job_level=emp_create.job_level,
        monthly_income=emp_create.monthly_income,
        years_at_company=emp_create.years_at_company,
        years_in_current_role=emp_create.years_in_current_role,
        years_since_last_promotion=emp_create.years_since_last_promotion,
        performance_rating=emp_create.performance_rating,
        job_satisfaction=emp_create.job_satisfaction,
        work_life_balance=emp_create.work_life_balance,
        training_hours=emp_create.training_hours,
        overtime=emp_create.overtime
    )
    
    # Run prediction
    pred_res = predict_employee_attrition(pred_req)
    
    # 2. Map fields to database model
    db_employee = Employee(
        id=emp_create.id,
        name=emp_create.name,
        email=emp_create.email,
        age=emp_create.age,
        gender=emp_create.gender,
        marital_status=emp_create.marital_status,
        distance_from_home=emp_create.distance_from_home,
        department=emp_create.department,
        job_role=emp_create.job_role,
        job_level=emp_create.job_level,
        monthly_income=emp_create.monthly_income,
        years_at_company=emp_create.years_at_company,
        years_in_current_role=emp_create.years_in_current_role,
        years_since_last_promotion=emp_create.years_since_last_promotion,
        performance_rating=emp_create.performance_rating,
        job_satisfaction=emp_create.job_satisfaction,
        work_life_balance=emp_create.work_life_balance,
        training_hours=emp_create.training_hours,
        overtime=emp_create.overtime,
        status=emp_create.status,
        risk_score=pred_res.probability,
        risk_level=pred_res.risk_level,
        last_predicted_at=datetime.utcnow()
    )
    
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    # 3. Log into prediction histories
    db_history = PredictionHistory(
        employee_id=db_employee.id,
        age=db_employee.age,
        monthly_income=db_employee.monthly_income,
        job_satisfaction=db_employee.job_satisfaction,
        work_life_balance=db_employee.work_life_balance,
        overtime=db_employee.overtime,
        risk_score=db_employee.risk_score,
        risk_level=db_employee.risk_level
    )
    db.add(db_history)
    db.commit()
    
    return db_employee

def update_employee(db: Session, employee_id: str, emp_update: EmployeeUpdate) -> Optional[Employee]:
    """
    Updates employee details, re-runs model predictions, updates db record, and histories.
    """
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        return None
        
    # Update only fields that are provided
    update_data = emp_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_employee, key, value)
        
    # Re-run prediction
    pred_req = PredictionRequest(
        age=db_employee.age,
        gender=db_employee.gender,
        marital_status=db_employee.marital_status,
        distance_from_home=db_employee.distance_from_home,
        department=db_employee.department,
        job_role=db_employee.job_role,
        job_level=db_employee.job_level,
        monthly_income=db_employee.monthly_income,
        years_at_company=db_employee.years_at_company,
        years_in_current_role=db_employee.years_in_current_role,
        years_since_last_promotion=db_employee.years_since_last_promotion,
        performance_rating=db_employee.performance_rating,
        job_satisfaction=db_employee.job_satisfaction,
        work_life_balance=db_employee.work_life_balance,
        training_hours=db_employee.training_hours,
        overtime=db_employee.overtime
    )
    
    pred_res = predict_employee_attrition(pred_req)
    
    db_employee.risk_score = pred_res.probability
    db_employee.risk_level = pred_res.risk_level
    db_employee.last_predicted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_employee)
    
    # Save into histories
    db_history = PredictionHistory(
        employee_id=db_employee.id,
        age=db_employee.age,
        monthly_income=db_employee.monthly_income,
        job_satisfaction=db_employee.job_satisfaction,
        work_life_balance=db_employee.work_life_balance,
        overtime=db_employee.overtime,
        risk_score=db_employee.risk_score,
        risk_level=db_employee.risk_level
    )
    db.add(db_history)
    db.commit()
    
    return db_employee

def delete_employee(db: Session, employee_id: str) -> bool:
    """
    Deletes an employee from the database (predictions are cascade deleted).
    """
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        return False
        
    db.delete(db_employee)
    db.commit()
    return True

def import_employees_csv(db: Session, csv_file_content: str) -> Dict[str, Any]:
    """
    Parses a CSV string, creates employee records, runs predictions, and saves to DB.
    """
    f = io.StringIO(csv_file_content)
    reader = csv.DictReader(f)
    
    success_count = 0
    error_count = 0
    errors = []
    
    for idx, row in enumerate(reader):
        try:
            # Map columns cleanly
            emp_id = row.get("EmployeeID") or row.get("id")
            if not emp_id:
                # Generate unique ID
                emp_id = f"EMP{int(datetime.utcnow().timestamp())}{idx}"
            
            # Check if ID already exists
            if get_employee_by_id(db, emp_id):
                error_count += 1
                errors.append(f"Row {idx + 1}: Employee with ID {emp_id} already exists.")
                continue
                
            # Parse fields and cast numeric values
            emp_create = EmployeeCreate(
                id=emp_id,
                name=row.get("Name") or row.get("name") or f"Imported Employee {idx + 1}",
                email=row.get("Email") or row.get("email") or f"imported.emp{idx + 1}@attrisense.com",
                age=int(row.get("Age") or row.get("age", 30)),
                gender=row.get("Gender") or row.get("gender", "Male"),
                marital_status=row.get("MaritalStatus") or row.get("marital_status", "Single"),
                distance_from_home=int(row.get("DistanceFromHome") or row.get("distance_from_home", 10)),
                department=row.get("Department") or row.get("department", "IT"),
                job_role=row.get("JobRole") or row.get("job_role", "Software Engineer"),
                job_level=int(row.get("JobLevel") or row.get("job_level", 1)),
                monthly_income=int(row.get("MonthlyIncome") or row.get("monthly_income", 5000)),
                years_at_company=int(row.get("YearsAtCompany") or row.get("years_at_company", 2)),
                years_in_current_role=int(row.get("YearsInCurrentRole") or row.get("years_in_current_role", 1)),
                years_since_last_promotion=int(row.get("YearsSinceLastPromotion") or row.get("years_since_last_promotion", 0)),
                performance_rating=int(row.get("PerformanceRating") or row.get("performance_rating", 3)),
                job_satisfaction=int(row.get("JobSatisfaction") or row.get("job_satisfaction", 3)),
                work_life_balance=int(row.get("WorkLifeBalance") or row.get("work_life_balance", 3)),
                training_hours=int(row.get("TrainingHours") or row.get("training_hours", 20)),
                overtime=row.get("Overtime") or row.get("overtime", "No"),
                status=row.get("Status") or row.get("status", "Active"),
                location=row.get("Location") or row.get("location", "HQ"),
                manager_name=row.get("ManagerName") or row.get("manager_name", "N/A")
            )
            
            create_employee(db, emp_create)
            success_count += 1
        except Exception as e:
            error_count += 1
            errors.append(f"Row {idx + 1} Error: {str(e)}")
            
    return {
        "success_count": success_count,
        "error_count": error_count,
        "errors": errors
    }
