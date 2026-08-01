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

import pandas as pd

REQUIRED_COLUMNS = ["MonthlyIncome", "Age", "Department", "JobRole"]

COLUMN_ALIAS_MAP = {
    "employeeid": "EmployeeID",
    "id": "EmployeeID",
    "emp_id": "EmployeeID",
    "name": "Name",
    "full_name": "Name",
    "email": "Email",
    "age": "Age",
    "gender": "Gender",
    "maritalstatus": "MaritalStatus",
    "marital_status": "MaritalStatus",
    "distancefromhome": "DistanceFromHome",
    "distance_from_home": "DistanceFromHome",
    "department": "Department",
    "jobrole": "JobRole",
    "job_role": "JobRole",
    "joblevel": "JobLevel",
    "job_level": "JobLevel",
    "monthlyincome": "MonthlyIncome",
    "monthly_income": "MonthlyIncome",
    "salary": "MonthlyIncome",
    "income": "MonthlyIncome",
    "yearsatcompany": "YearsAtCompany",
    "years_at_company": "YearsAtCompany",
    "yearsincurrentrole": "YearsInCurrentRole",
    "years_in_current_role": "YearsInCurrentRole",
    "yearssincelastpromotion": "YearsSinceLastPromotion",
    "years_since_last_promotion": "YearsSinceLastPromotion",
    "performancerating": "PerformanceRating",
    "performance_rating": "PerformanceRating",
    "jobsatisfaction": "JobSatisfaction",
    "job_satisfaction": "JobSatisfaction",
    "worklifebalance": "WorkLifeBalance",
    "work_life_balance": "WorkLifeBalance",
    "traininghours": "TrainingHours",
    "training_hours": "TrainingHours",
    "overtime": "Overtime",
    "status": "Status",
    "location": "Location",
    "managername": "ManagerName",
    "manager_name": "ManagerName",
}


def decode_csv_bytes(file_bytes: bytes) -> tuple[str, str]:
    """Tries decoding file bytes with common encodings."""
    encodings = ["utf-8-sig", "utf-8", "latin1", "cp1252", "iso-8859-1"]
    for enc in encodings:
        try:
            decoded_text = file_bytes.decode(enc)
            return decoded_text, enc
        except (UnicodeDecodeError, AttributeError):
            continue
    raise ValueError("Unsupported file format or encoding issues.")


def parse_csv_dataframe(file_input: Any) -> tuple[pd.DataFrame, str, str]:
    """
    Parses CSV content into a Pandas DataFrame using automatic encoding and delimiter detection.
    Returns (df, detected_encoding, detected_delimiter).
    """
    if isinstance(file_input, bytes):
        text_content, encoding = decode_csv_bytes(file_input)
    else:
        text_content = str(file_input)
        encoding = "utf-8"

    if not text_content.strip():
        raise ValueError("Unsupported file format: empty file.")

    delimiters = [",", ";", "\t", "|"]
    best_df = None
    best_delimiter = ","
    max_cols = 0

    # Try pd.read_csv with python engine auto separator
    try:
        df_auto = pd.read_csv(io.StringIO(text_content), sep=None, engine="python")
        if df_auto.shape[1] > 1:
            best_df = df_auto
            best_delimiter = "auto"
            max_cols = df_auto.shape[1]
    except Exception:
        pass

    if best_df is None or max_cols <= 1:
        for sep in delimiters:
            try:
                df_temp = pd.read_csv(io.StringIO(text_content), sep=sep)
                if df_temp.shape[1] > max_cols:
                    max_cols = df_temp.shape[1]
                    best_df = df_temp
                    best_delimiter = sep
            except Exception:
                continue

    if best_df is None or best_df.empty:
        raise ValueError("Invalid delimiter or empty CSV file.")

    if best_df.shape[1] <= 1:
        single_col = str(best_df.columns[0])
        # Check if single column contains delimiters that failed to split
        if any(d in single_col for d in [";", "\t", "|"]):
            raise ValueError("Invalid delimiter: system failed to split columns cleanly.")

    # Normalize column names
    renamed_cols = {}
    for col in best_df.columns:
        clean_key = str(col).strip().replace(" ", "").replace("_", "").replace("-", "").lower()
        if clean_key in COLUMN_ALIAS_MAP:
            renamed_cols[col] = COLUMN_ALIAS_MAP[clean_key]
        else:
            renamed_cols[col] = str(col).strip()

    best_df = best_df.rename(columns=renamed_cols)
    return best_df, encoding, best_delimiter


def preview_employees_csv(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Validates CSV, checks required columns, and returns a preview of the first 10 rows.
    """
    try:
        df, encoding, delimiter = parse_csv_dataframe(file_bytes)
    except ValueError as ve:
        return {
            "valid": False,
            "filename": filename,
            "total_rows": 0,
            "headers": [],
            "missing_required_columns": [],
            "rows_preview": [],
            "detected_encoding": "unknown",
            "detected_delimiter": "unknown",
            "error_message": str(ve)
        }
    except Exception:
        return {
            "valid": False,
            "filename": filename,
            "total_rows": 0,
            "headers": [],
            "missing_required_columns": [],
            "rows_preview": [],
            "detected_encoding": "unknown",
            "detected_delimiter": "unknown",
            "error_message": "Unsupported file format"
        }

    present_columns = set(df.columns)
    missing_cols = [req for req in REQUIRED_COLUMNS if req not in present_columns]

    if missing_cols:
        first_missing = missing_cols[0]
        return {
            "valid": False,
            "filename": filename,
            "total_rows": len(df),
            "headers": [str(c) for c in df.columns],
            "missing_required_columns": missing_cols,
            "rows_preview": [],
            "detected_encoding": encoding,
            "detected_delimiter": delimiter,
            "error_message": f"Missing required column: {first_missing}"
        }

    # Format first 10 rows for preview cleanly
    preview_df = df.head(10).fillna("")
    preview_rows = preview_df.to_dict(orient="records")

    return {
        "valid": True,
        "filename": filename,
        "total_rows": len(df),
        "headers": [str(c) for c in df.columns],
        "missing_required_columns": [],
        "rows_preview": preview_rows,
        "detected_encoding": encoding,
        "detected_delimiter": delimiter,
        "error_message": None
    }


def import_employees_csv(db: Session, csv_file_input: Any) -> Dict[str, Any]:
    """
    Parses a CSV string or bytes, creates employee records, runs predictions, and saves to DB.
    """
    # 1. Parse dataframe
    try:
        df, _, _ = parse_csv_dataframe(csv_file_input)
    except ValueError as ve:
        raise ValueError(str(ve))
    except Exception as e:
        raise ValueError("Unsupported file format or corrupted CSV data.")

    # 2. Check required columns
    present_columns = set(df.columns)
    missing_cols = [req for req in REQUIRED_COLUMNS if req not in present_columns]
    if missing_cols:
        raise ValueError(f"Missing required column: {missing_cols[0]}")

    if df.empty:
        raise ValueError("CSV contains empty required fields")

    success_count = 0
    error_count = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            # Validate missing required fields in row
            for req in REQUIRED_COLUMNS:
                val = row.get(req)
                if pd.isna(val) or str(val).strip() == "":
                    raise ValueError(f"CSV contains empty required fields ({req})")

            emp_id = str(row.get("EmployeeID") or f"EMP{int(datetime.utcnow().timestamp())}{idx}").strip()
            
            # Check if ID already exists
            if get_employee_by_id(db, emp_id):
                error_count += 1
                errors.append(f"Row {idx + 1}: Employee with ID {emp_id} already exists.")
                continue

            emp_create = EmployeeCreate(
                id=emp_id,
                name=str(row.get("Name") or f"Imported Employee {idx + 1}").strip(),
                email=str(row.get("Email") or f"imported.emp{idx + 1}@attrisense.com").strip(),
                age=int(float(row.get("Age", 30))),
                gender=str(row.get("Gender", "Male")).strip(),
                marital_status=str(row.get("MaritalStatus", "Single")).strip(),
                distance_from_home=int(float(row.get("DistanceFromHome", 10))),
                department=str(row.get("Department", "IT")).strip(),
                job_role=str(row.get("JobRole", "Software Engineer")).strip(),
                job_level=int(float(row.get("JobLevel", 1))),
                monthly_income=int(float(row.get("MonthlyIncome", 5000))),
                years_at_company=int(float(row.get("YearsAtCompany", 2))),
                years_in_current_role=int(float(row.get("YearsInCurrentRole", 1))),
                years_since_last_promotion=int(float(row.get("YearsSinceLastPromotion", 0))),
                performance_rating=int(float(row.get("PerformanceRating", 3))),
                job_satisfaction=int(float(row.get("JobSatisfaction", 3))),
                work_life_balance=int(float(row.get("WorkLifeBalance", 3))),
                training_hours=int(float(row.get("TrainingHours", 20))),
                overtime=str(row.get("Overtime", "No")).strip(),
                status=str(row.get("Status", "Active")).strip(),
                location=str(row.get("Location", "HQ")).strip(),
                manager_name=str(row.get("ManagerName", "N/A")).strip()
            )

            create_employee(db, emp_create)
            success_count += 1
        except ValueError as ve:
            error_count += 1
            errors.append(f"Row {idx + 1}: {str(ve)}")
        except Exception as e:
            error_count += 1
            errors.append(f"Row {idx + 1}: Failed to process record ({str(e)})")

    return {
        "success_count": success_count,
        "error_count": error_count,
        "errors": errors
    }

