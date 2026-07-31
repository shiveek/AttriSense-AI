from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from backend.app.database.connection import get_db
from backend.app.models.db_models import User, Role, AuditLog
from backend.app.schemas.schemas import (
    UserCreate, UserResponse, UserLogin, TokenResponse,
    TokenRefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from backend.app.core.auth import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, create_reset_token, decode_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Restrict public registration from assigning Admin role
    if user_data.role_name not in ["HR_Manager", "Analyst", "User"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration with Admin privileges is not allowed. Please contact an administrator."
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    # Get or create Role
    role = db.query(Role).filter(Role.name == user_data.role_name).first()
    if not role:
        # If role doesn't exist, create it dynamically (or return error, but dynamic seed is robust)
        role = Role(name=user_data.role_name, description=f"{user_data.role_name} Access Level")
        db.add(role)
        db.commit()
        db.refresh(role)
        
    # Create User
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name,
        role_id=role.id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Audit log
    log = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        details=f"Registered user: {new_user.email} as role: {role.name}"
    )
    db.add(log)
    db.commit()
    
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has been disabled."
        )
        
    # Generate Tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Audit log
    log = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        details=f"Successful sign in for: {user.email}"
    )
    db.add(log)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_data: TokenRefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(refresh_data.refresh_token)
    email: str = payload.get("sub")
    token_type: str = payload.get("type")
    
    if not email or token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token."
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or disabled."
        )
        
    # Generate new pair of tokens
    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Security best practice: don't reveal if user exists, just return success
        return {"message": "If this email exists in our records, a reset link has been dispatched."}
        
    # Generate dedicated, short-lived password reset token
    reset_token = create_reset_token(data={"sub": user.email})
    
    # In a real system, email would be dispatched.
    # For testing, we log the reset token securely to standard logs.
    import logging
    logger = logging.getLogger("AuthRouter")
    logger.info(f"SECURITY: Generated reset token for {user.email}: {reset_token}")

    # Create Audit Log
    log = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_REQUESTED",
        details=f"Requested password recovery link for: {user.email}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "If this email exists in our records, a reset link has been dispatched."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    email: str = payload.get("sub")
    token_type: str = payload.get("type")
    
    # Enforce password reset token type check
    if token_type != "reset":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. A password reset token is required."
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found or deactivated."
        )
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_SUCCESSFUL",
        details=f"Successfully reset credentials for: {user.email}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Credentials updated successfully."}
