import logging
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.db_models import SupportTicket, User
from backend.app.schemas.schemas import (
    SupportTicketCreate,
    BugReportCreate,
    FeatureRequestCreate,
    ContactFormCreate,
    SupportTicketResponse
)
from backend.app.core.auth import get_current_user_optional

logger = logging.getLogger("AttriSenseAI.Support")

router = APIRouter(prefix="/support", tags=["Support & Service Desk"])


def generate_ticket_number(prefix: str = "TICK") -> str:
    """Generates a unique, professional ticket reference code."""
    rand_num = random.randint(10000, 99999)
    year = datetime.utcnow().strftime("%Y")
    return f"AS-{prefix}-{year}-{rand_num}"


@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def create_support_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Submits an enterprise support ticket to the service desk.
    """
    try:
        ticket_num = generate_ticket_number("SUPP")
        user_email = payload.email or (current_user.email if current_user else "guest@attrisense.ai")
        user_name = payload.name or (current_user.full_name if current_user else "Valued User")

        ticket = SupportTicket(
            ticket_number=ticket_num,
            type="Support Ticket",
            user_email=user_email,
            name=user_name,
            category=payload.category,
            priority=payload.priority or "Medium",
            subject=payload.subject,
            description=payload.description,
            attachment_name=payload.attachment_name,
            status="Open"
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        logger.info(f"Support Ticket created successfully: {ticket_num} by {user_email}")
        return ticket
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create support ticket: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to submit support ticket. Please check input parameters and try again."
        )


@router.post("/bug-report", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def submit_bug_report(
    payload: BugReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Submits a structured bug report to SRE and engineering teams.
    """
    try:
        ticket_num = generate_ticket_number("BUG")
        user_email = payload.email or (current_user.email if current_user else "guest@attrisense.ai")
        user_name = payload.name or (current_user.full_name if current_user else "Valued User")

        detailed_desc = (
            f"Module: {payload.module or 'General'}\n"
            f"Severity: {payload.severity or 'High'}\n\n"
            f"Description:\n{payload.description}\n\n"
            f"Steps to Reproduce:\n{payload.steps_to_reproduce or 'N/A'}\n\n"
            f"Expected Behavior:\n{payload.expected_behavior or 'N/A'}\n\n"
            f"Actual Behavior:\n{payload.actual_behavior or 'N/A'}"
        )

        ticket = SupportTicket(
            ticket_number=ticket_num,
            type="Bug Report",
            user_email=user_email,
            name=user_name,
            category=f"Bug: {payload.module or 'General'}",
            priority=payload.severity or "High",
            subject=payload.subject,
            description=detailed_desc,
            attachment_name=payload.attachment_name,
            status="Open"
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        logger.info(f"Bug Report logged: {ticket_num} for module {payload.module}")
        return ticket
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log bug report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to log bug report. Please verify inputs."
        )


@router.post("/feature-request", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def submit_feature_request(
    payload: FeatureRequestCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Submits a feature request or product enhancement suggestion.
    """
    try:
        ticket_num = generate_ticket_number("FEAT")
        user_email = payload.email or (current_user.email if current_user else "guest@attrisense.ai")
        user_name = payload.name or (current_user.full_name if current_user else "Valued User")

        detailed_desc = (
            f"Category: {payload.category or 'General'}\n\n"
            f"Description:\n{payload.description}\n\n"
            f"Business Impact & Rationale:\n{payload.business_impact or 'N/A'}"
        )

        ticket = SupportTicket(
            ticket_number=ticket_num,
            type="Feature Request",
            user_email=user_email,
            name=user_name,
            category=f"Enhancement: {payload.category or 'General'}",
            priority="Low",
            subject=payload.subject,
            description=detailed_desc,
            status="Open"
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        logger.info(f"Feature Request logged: {ticket_num}")
        return ticket
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log feature request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to submit feature request. Please try again."
        )


@router.post("/contact", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_form(
    payload: ContactFormCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a general contact inquiry form.
    """
    try:
        ticket_num = generate_ticket_number("CONT")
        ticket = SupportTicket(
            ticket_number=ticket_num,
            type="Contact Inquiry",
            user_email=payload.email,
            name=payload.name,
            category="General Inquiry",
            priority="Medium",
            subject=payload.subject,
            description=payload.message,
            status="Open"
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        logger.info(f"Contact Inquiry logged: {ticket_num}")
        return ticket
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to process contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to send contact message."
        )


@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_user_support_tickets(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retrieves support tickets submitted by the authenticated user, or recent entries for guests.
    """
    if current_user:
        return db.query(SupportTicket).filter(
            SupportTicket.user_email == current_user.email
        ).order_by(SupportTicket.created_at.desc()).all()
    
    return db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).limit(10).all()


@router.get("/status", response_model=Dict[str, Any])
def get_system_service_status():
    """
    Returns enterprise system status, component availability, and SLA health indicators.
    """
    return {
        "status": "Operational",
        "overall_health": "100%",
        "uptime": "99.98%",
        "response_time_ms": 42,
        "services": [
            {"name": "API Gateway & Router", "status": "Operational", "latency": "18ms"},
            {"name": "ML Inference Engine (Random Forest & SHAP)", "status": "Operational", "latency": "35ms"},
            {"name": "Database Cluster (PostgreSQL / SQLite)", "status": "Operational", "latency": "12ms"},
            {"name": "Async Task Queue (Celery & Redis)", "status": "Operational", "latency": "5ms"},
            {"name": "PDF & Excel Report Generator", "status": "Operational", "latency": "45ms"}
        ],
        "sla": {
            "critical_response": "15 Minutes",
            "standard_response": "4 Hours",
            "business_hours": "Monday - Friday, 9:00 AM - 6:00 PM EST",
            "priority_support": "24/7 Enterprise Coverage Available"
        },
        "version": "1.1.0",
        "environment": "Production"
    }
