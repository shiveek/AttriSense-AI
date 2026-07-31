from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.schemas.schemas import DashboardStatsResponse, AIInsightResponse
from backend.app.services import analytics_service, insights_service
from backend.app.core.auth import get_current_user, RoleChecker, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Insights"])

# Allow any authenticated role to view dashboard statistics
any_role_required = RoleChecker(["Admin", "HR_Manager", "Analyst", "User"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(any_role_required)
):
    """
    Retrieves global workforce metrics, risk distributions, and trend data.
    Requires authentication.
    """
    return analytics_service.get_dashboard_stats(db)

@router.get("/insights", response_model=List[AIInsightResponse])
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(any_role_required)
):
    """
    Generates AI-derived retention insights based on workforce demographic correlations.
    Requires authentication.
    """
    return insights_service.generate_ai_insights(db)
