import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

# Add workspace to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from backend.app.database.connection import Base
from backend.app.models.db_models import Role, User, Employee
from backend.app.schemas.schemas import UserCreate, ForgotPasswordRequest, ResetPasswordRequest
from backend.app.core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_reset_token,
    decode_token
)
from backend.app.api.auth import register, forgot_password, reset_password
from backend.app.api.health import get_system_health

class ProductionVerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Set up an in-memory SQLite database for test isolation
        cls.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        
        # Seed default roles
        db = cls.SessionLocal()
        roles = ["Admin", "HR_Manager", "Analyst", "User"]
        cls.db_roles = {}
        for r_name in roles:
            role = Role(name=r_name, description=f"{r_name} role")
            db.add(role)
            db.commit()
            db.refresh(role)
            cls.db_roles[r_name] = role
        db.close()

    def setUp(self):
        self.db = self.SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_1_registration_role_protection(self):
        """
        Verify that registering as an Admin returns an HTTP 400 error.
        """
        user_data = UserCreate(
            email="malicious.admin@attrisense.com",
            password="password123",
            full_name="Malicious User",
            role_name="Admin"
        )
        
        # This must raise HTTPException with status 400
        with self.assertRaises(HTTPException) as context:
            register(user_data, self.db)
        
        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("Admin privileges is not allowed", context.exception.detail)

    def test_2_registration_allowed_roles(self):
        """
        Verify that registering as HR_Manager is permitted.
        """
        user_data = UserCreate(
            email="manager@attrisense.com",
            password="password123",
            full_name="Sarah Connor",
            role_name="HR_Manager"
        )
        
        registered_user = register(user_data, self.db)
        self.assertEqual(registered_user.email, "manager@attrisense.com")
        self.assertEqual(registered_user.role.name, "HR_Manager")

    def test_3_password_reset_token_isolation(self):
        """
        Verify that password reset fails if a standard access token is used instead of a dedicated reset token.
        """
        # Create standard user
        user_data = UserCreate(
            email="employee@attrisense.com",
            password="oldpassword123",
            full_name="Standard Employee",
            role_name="User"
        )
        register(user_data, self.db)
        
        # Generate standard access token
        access_token = create_access_token(data={"sub": "employee@attrisense.com"})
        
        # Attempt to reset password using access token
        reset_req = ResetPasswordRequest(
            token=access_token,
            new_password="newpassword123"
        )
        
        with self.assertRaises(HTTPException) as context:
            reset_password(reset_req, self.db)
            
        self.assertEqual(context.exception.status_code, 401)
        self.assertIn("A password reset token is required", context.exception.detail)

    def test_4_password_reset_success(self):
        """
        Verify that password reset succeeds using a proper reset token.
        """
        email = "employee@attrisense.com"
        
        # Generate dedicated reset token
        reset_token = create_reset_token(data={"sub": email})
        
        reset_req = ResetPasswordRequest(
            token=reset_token,
            new_password="brandnewpassword123"
        )
        
        response = reset_password(reset_req, self.db)
        self.assertEqual(response["message"], "Credentials updated successfully.")
        
        # Verify password matches in DB
        user = self.db.query(User).filter(User.email == email).first()
        self.assertTrue(verify_password("brandnewpassword123", user.hashed_password))

    def test_5_health_check_endpoint(self):
        """
        Verify that health check reports DB status and executes cleanly.
        """
        res = get_system_health(self.db)
        self.assertEqual(res["database"], "online")
        self.assertIn(res["status"], ["healthy", "degraded"])  # ML engine might be offline in mock env

    def test_6_csv_validation_missing_required_column(self):
        """
        Verify that uploading a CSV with missing required columns raises a friendly error message.
        """
        from backend.app.services.employee_service import import_employees_csv, preview_employees_csv

        # CSV missing 'MonthlyIncome'
        invalid_csv = "EmployeeID,Name,Email,Age,Department,JobRole\nEMP1,John Doe,john@test.com,30,IT,Software Engineer"
        
        # Test preview
        preview_res = preview_employees_csv(invalid_csv.encode("utf-8"), "invalid.csv")
        self.assertFalse(preview_res["valid"])
        self.assertIn("Missing required column: MonthlyIncome", preview_res["error_message"])

        # Test import error
        with self.assertRaises(ValueError) as context:
            import_employees_csv(self.db, invalid_csv.encode("utf-8"))
        self.assertIn("Missing required column: MonthlyIncome", str(context.exception))

    def test_7_csv_preview_and_decoding(self):
        """
        Verify auto-decoding and preview of valid CSV files.
        """
        from backend.app.services.employee_service import preview_employees_csv
        valid_csv = "EmployeeID;Name;Email;Age;Department;JobRole;MonthlyIncome\nEMP200;Jane Smith;jane@test.com;28;Sales;Sales Executive;7500"
        
        preview_res = preview_employees_csv(valid_csv.encode("latin1"), "valid_latin1.csv")
        self.assertTrue(preview_res["valid"])
        self.assertEqual(preview_res["total_rows"], 1)
        self.assertEqual(len(preview_res["rows_preview"]), 1)
        self.assertEqual(preview_res["rows_preview"][0]["Name"], "Jane Smith")

    def test_8_support_ticket_creation(self):
        """
        Verify support ticket and bug report API processing.
        """
        from backend.app.schemas.schemas import SupportTicketCreate, BugReportCreate
        from backend.app.api.support import create_support_ticket, submit_bug_report

        ticket_payload = SupportTicketCreate(
            name="Alice Admin",
            email="alice@attrisense.com",
            category="CSV Ingestion",
            priority="High",
            subject="Bulk Ingestion Question",
            description="Need guidance on custom column headers."
        )

        ticket_res = create_support_ticket(ticket_payload, self.db)
        self.assertIsNotNone(ticket_res.ticket_number)
        self.assertTrue(ticket_res.ticket_number.startswith("AS-SUPP-"))
        self.assertEqual(ticket_res.user_email, "alice@attrisense.com")

        bug_payload = BugReportCreate(
            name="Bob User",
            email="bob@attrisense.com",
            module="CSV Ingestion",
            severity="Critical",
            subject="Parse Timeout",
            description="Large file parsing error.",
            steps_to_reproduce="Upload 10k row file",
            expected_behavior="Parse within 2s",
            actual_behavior="Took 15s"
        )
        bug_res = submit_bug_report(bug_payload, self.db)
        self.assertIsNotNone(bug_res.ticket_number)
        self.assertTrue(bug_res.ticket_number.startswith("AS-BUG-"))

if __name__ == "__main__":
    unittest.main()

