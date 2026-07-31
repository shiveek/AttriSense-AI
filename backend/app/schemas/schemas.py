from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Employee schemas
class EmployeeBase(BaseModel):
    name: str = Field(..., example="John Smith")
    email: EmailStr = Field(..., example="john.smith@company.com")
    age: int = Field(..., ge=18, le=75, example=35)
    gender: str = Field(..., example="Male")
    marital_status: str = Field(..., example="Single")
    distance_from_home: int = Field(..., ge=1, le=100, example=10)
    department: str = Field(..., example="IT")
    job_role: str = Field(..., example="Software Engineer")
    job_level: int = Field(..., ge=1, le=5, example=2)
    monthly_income: int = Field(..., ge=1000, le=50000, example=6500)
    years_at_company: int = Field(..., ge=0, le=50, example=5)
    years_in_current_role: int = Field(..., ge=0, le=50, example=2)
    years_since_last_promotion: int = Field(..., ge=0, le=50, example=1)
    performance_rating: int = Field(..., ge=1, le=4, example=3)
    job_satisfaction: int = Field(..., ge=1, le=4, example=3)
    work_life_balance: int = Field(..., ge=1, le=4, example=3)
    training_hours: int = Field(..., ge=0, le=150, example=24)
    overtime: str = Field(..., example="Yes")
    status: Optional[str] = Field("Active", example="Active")
    location: Optional[str] = Field("HQ", example="HQ")
    manager_name: Optional[str] = Field("N/A", example="N/A")

class EmployeeCreate(EmployeeBase):
    id: str = Field(..., example="EMP0001")

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    distance_from_home: Optional[int] = None
    department: Optional[str] = None
    job_role: Optional[str] = None
    job_level: Optional[int] = None
    monthly_income: Optional[int] = None
    years_at_company: Optional[int] = None
    years_in_current_role: Optional[int] = None
    years_since_last_promotion: Optional[int] = None
    performance_rating: Optional[int] = None
    job_satisfaction: Optional[int] = None
    work_life_balance: Optional[int] = None
    training_hours: Optional[int] = None
    overtime: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    manager_name: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: str
    risk_score: float
    risk_level: str
    last_predicted_at: datetime

    class Config:
        from_attributes = True

# Auth schemas
class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role_name: str = "HR_Manager" # default role

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: RoleResponse
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

# Audit Log schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    type: str
    created_at: datetime

    class Config:
        from_attributes = True

# Report schemas
class ReportResponse(BaseModel):
    id: int
    name: str
    type: str
    file_path: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Recommendation schemas
class RecommendationResponse(BaseModel):
    id: int
    employee_id: str
    category: str
    recommended_action: str
    impact_score: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Prediction contracts
class PredictionRequest(BaseModel):
    age: int
    gender: str
    marital_status: str
    distance_from_home: int
    department: str
    job_role: str
    job_level: int
    monthly_income: int
    years_at_company: int
    years_in_current_role: int
    years_since_last_promotion: int
    performance_rating: int
    job_satisfaction: int
    work_life_balance: int
    training_hours: int
    overtime: str

class SHAPContribution(BaseModel):
    feature: str
    value: Any
    contribution: float

class PredictionResponse(BaseModel):
    probability: float
    risk_level: str
    confidence: float
    contributions: List[SHAPContribution]
    recommendations: List[str]

# Dashboard data structures
class DepartmentDistributionItem(BaseModel):
    name: str
    value: int

class AttritionTrendItem(BaseModel):
    month: str
    attrition: int

class RiskDistribution(BaseModel):
    high: int
    medium: int
    low: int

class DashboardStatsResponse(BaseModel):
    total_employees: int
    attrition_rate: float
    ai_predictions_count: int
    retention_rate: float
    risk_distribution: RiskDistribution
    department_distribution: List[DepartmentDistributionItem]
    attrition_trend: List[AttritionTrendItem]

class AIInsightResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    impact: str # High, Medium, Low
    recommendation: str
