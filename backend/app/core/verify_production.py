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

if __name__ == "__main__":
    unittest.main()
