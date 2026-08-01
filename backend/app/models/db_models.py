from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

# Association table for Many-to-Many relationship between Roles and Permissions
role_permission_association = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False) # Admin, HR_Manager, Analyst, User
    description = Column(String, nullable=True)

    # Relationships
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permission_association, back_populates="roles")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False) # e.g. "employees:create", "predictions:run"
    description = Column(String, nullable=True)

    # Relationships
    roles = relationship("Role", secondary=role_permission_association, back_populates="permissions")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reports = relationship("Report", back_populates="creator")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    marital_status = Column(String, nullable=False)
    distance_from_home = Column(Integer, nullable=False)
    
    department = Column(String, nullable=False)
    job_role = Column(String, nullable=False)
    job_level = Column(Integer, nullable=False)
    monthly_income = Column(Integer, nullable=False)
    
    years_at_company = Column(Integer, nullable=False)
    years_in_current_role = Column(Integer, nullable=False)
    years_since_last_promotion = Column(Integer, nullable=False)
    
    performance_rating = Column(Integer, nullable=False)
    job_satisfaction = Column(Integer, nullable=False)
    work_life_balance = Column(Integer, nullable=False)
    training_hours = Column(Integer, nullable=False)
    overtime = Column(String, nullable=False)
    
    status = Column(String, default="Active") # Active, On Leave, Terminated
    location = Column(String, default="HQ") # HQ, Remote, Regional
    manager_name = Column(String, default="N/A")
    risk_score = Column(Float, default=0.0)    # Predicted probability of leaving (0-100)
    risk_level = Column(String, default="Low") # Low, Medium, High
    last_predicted_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    predictions = relationship("PredictionHistory", back_populates="employee", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="employee", cascade="all, delete-orphan")


class PredictionHistory(Base):
    __tablename__ = "prediction_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    age = Column(Integer, nullable=False)
    monthly_income = Column(Integer, nullable=False)
    job_satisfaction = Column(Integer, nullable=False)
    work_life_balance = Column(Integer, nullable=False)
    overtime = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    predicted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="predictions")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False) # Salary, Promotion, Training, Mentorship, Workload
    recommended_action = Column(String, nullable=False)
    impact_score = Column(Float, nullable=False) # Expected drop in risk score (0-100)
    status = Column(String, default="Proposed") # Proposed, Applied, Dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="recommendations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False) # LOGIN, EMPLOYEE_UPDATE, model_retrain, etc.
    target_id = Column(String, nullable=True)
    details = Column(String, nullable=True) # Text representation of changes
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String, default="info") # info, alert, success
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # PDF, EXCEL
    file_path = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, Completed, Failed
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="reports")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False, default="Support Ticket") # Support Ticket, Bug Report, Feature Request, Contact
    user_email = Column(String, nullable=False, index=True)
    name = Column(String, nullable=True)
    category = Column(String, nullable=False)
    priority = Column(String, default="Medium") # Low, Medium, High, Urgent
    subject = Column(String, nullable=False)
    description = Column(String, nullable=False)
    attachment_name = Column(String, nullable=True)
    status = Column(String, default="Open") # Open, In Progress, Resolved, Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

