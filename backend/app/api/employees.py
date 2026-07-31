from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.database.connection import get_db
from backend.app.schemas.schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from backend.app.services import employee_service
from backend.app.core.auth import get_current_user, RoleChecker, User

router = APIRouter(prefix="/employees", tags=["Employees"])

# Define Role dependency checks
hr_or_admin_required = RoleChecker(["Admin", "HR_Manager"])
any_role_required = RoleChecker(["Admin", "HR_Manager", "Analyst", "User"])

@router.get("/", response_model=Dict[str, Any])
def read_employees(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search employee by name, ID or email"),
    department: Optional[str] = Query(None, description="Filter by department"),
    risk_level: Optional[str] = Query(None, description="Filter by attrition risk level"),
    status: Optional[str] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    current_user: User = Depends(any_role_required)
):
    """
    Retrieves a list of employees with optional filtering, search, and pagination.
    Requires authentication.
    """
    employees = employee_service.get_employees(
        db, search=search, department=department, risk_level=risk_level, status=status, skip=skip, limit=limit
    )
    total = employee_service.get_employee_count(
        db, search=search, department=department, risk_level=risk_level, status=status
    )
    return {
        "employees": [EmployeeResponse.model_validate(emp) for emp in employees],
        "total": total
    }

@router.get("/{employee_id}", response_model=EmployeeResponse)
def read_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(any_role_required)
):
    """
    Retrieves a single employee's profile by ID.
    Requires authentication.
    """
    employee = employee_service.get_employee_by_id(db, employee_id=employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found."
        )
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def add_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(hr_or_admin_required)
):
    """
    Adds a new employee profile to the database and evaluates their risk with the AI model.
    Requires Admin or HR_Manager role.
    """
    existing_emp = employee_service.get_employee_by_id(db, employee_id=employee.id)
    if existing_emp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with ID {employee.id} already exists."
        )
    return employee_service.create_employee(db, emp_create=employee)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(hr_or_admin_required)
):
    """
    Updates an employee's details and recalculates their attrition risk.
    Requires Admin or HR_Manager role.
    """
    employee = employee_service.get_employee_by_id(db, employee_id=employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found."
        )
    return employee_service.update_employee(db, employee_id=employee_id, emp_update=employee_update)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(hr_or_admin_required)
):
    """
    Permanently deletes an employee profile from the platform.
    Requires Admin or HR_Manager role.
    """
    success = employee_service.delete_employee(db, employee_id=employee_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found."
        )
    return None

@router.post("/upload", response_model=Dict[str, Any])
def upload_employees_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(hr_or_admin_required)
):
    """
    Ingests a CSV file of employee profiles, runs predictions, and saves records in bulk.
    Requires Admin or HR_Manager role.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files are accepted."
        )
    try:
        content = file.file.read().decode("utf-8")
        result = employee_service.import_employees_csv(db, content)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV processing failed: {str(e)}"
        )
