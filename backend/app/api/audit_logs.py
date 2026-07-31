from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from backend.app.database.connection import get_db
from backend.app.core.auth import get_current_user, RoleChecker, User
from backend.app.models.db_models import AuditLog
from backend.app.schemas.schemas import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["Audit & Security Logs"])

# Require Admin or HR_Manager role to view audit trail logs
admin_or_manager_only = RoleChecker(["Admin", "HR_Manager"])

@router.get("/", response_model=Dict[str, Any])
def read_audit_logs(
    db: Session = Depends(get_db),
    action: Optional[str] = Query(None, description="Filter logs by action name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1),
    current_user: User = Depends(admin_or_manager_only)
):
    """
    Retrieves system activity audit trails.
    Requires Admin or HR_Manager role.
    """
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
        
    total = query.count()
    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "logs": [AuditLogResponse.model_validate(log) for log in logs],
        "total": total
    }
