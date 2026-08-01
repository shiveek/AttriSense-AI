import os
import logging
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.connection import engine, SessionLocal, Base
from backend.app.models.db_models import Employee, Role, User
from backend.app.api.employees import router as employees_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.auth import router as auth_router
from backend.app.api.models import router as models_router
from backend.app.api.reports import router as reports_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.audit_logs import router as audit_logs_router
from backend.app.api.health import router as health_router
from backend.app.api.support import router as support_router
from backend.app.ml.generate_dataset import generate_employee_dataset

from backend.app.ml.pipeline import train_attrition_model
from backend.app.schemas.schemas import EmployeeCreate
from backend.app.services.employee_service import create_employee, get_employee_by_id
from backend.app.core.auth import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AttriSenseAI")

app = FastAPI(
    title="AttriSense AI API",
    description="Decision Intelligence API for Employee Attrition Risk Prediction & Explainability",
    version="1.0.0"
)

from backend.app.core.middleware import RequestLoggerMiddleware, GlobalExceptionMiddleware

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    allowed_origins = [
        "https://attrisense-ai.vercel.app", # Vercel Production Frontend
        "http://localhost:5173",            # Vite dev server
        "http://localhost:3000",
        "http://localhost:80",              # Nginx docker-compose
        "http://localhost"
    ]

# Add SRE middlewares
app.add_middleware(GlobalExceptionMiddleware)
app.add_middleware(RequestLoggerMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(employees_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(audit_logs_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(support_router, prefix="/api")


@app.get("/health", tags=["System Health"])
def root_health_check():
    """
    Direct root health check endpoint for cloud service probes (Render, K8s, AWS ALB).
    """
    from backend.app.api.health import get_system_health
    from backend.app.database.connection import SessionLocal
    db = SessionLocal()
    try:
        return get_system_health(db=db)
    finally:
        db.close()

# --- Full-Stack Single URL Integration: Mount React Frontend Build ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

frontend_dist_path = os.path.join(os.getcwd(), "frontend", "dist")
if os.path.exists(frontend_dist_path):
    logger.info(f"Serving static frontend build from {frontend_dist_path}")
    assets_path = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude API endpoints, Swagger docs, openapi.json, and health checks
        if full_path.startswith("api") or full_path.startswith("docs") or full_path == "openapi.json" or full_path.startswith("health"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = os.path.join(frontend_dist_path, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "app": "AttriSense AI Decision Intelligence Engine",
            "documentation": "/docs"
        }



def seed_database():
    """
    On startup, verifies ML model exists, seeds roles, default admin, and employee profiles.
    """
    db = SessionLocal()
    try:
        # 1. Seed Roles
        logger.info("Checking and seeding database roles...")
        roles_to_seed = ["Admin", "HR_Manager", "Analyst", "User"]
        db_roles = {}
        for role_name in roles_to_seed:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=f"{role_name} system permission role")
                db.add(role)
                db.commit()
                db.refresh(role)
            db_roles[role_name] = role

        # 2. Seed default Admin user
        logger.info("Checking and seeding default Admin credentials...")
        admin_email = "admin@attrisense.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                full_name="AttriSense Admin",
                role_id=db_roles["Admin"].id,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Default Admin account seeded successfully (admin@attrisense.com / admin123)")

        # 3. Check if database already has employee records
        employee_count = db.query(Employee).count()
        if employee_count > 0:
            logger.info("Database already contains employee profiles. Skipping seed.")
            return
            
        logger.info("Database is empty. Initiating seeding process...")
        
        # Ensure dataset exists
        dataset_path = "dataset/employee_attrition.csv"
        if not os.path.exists(dataset_path):
            logger.info("Synthetic dataset not found. Generating...")
            os.makedirs("dataset", exist_ok=True)
            generate_employee_dataset(dataset_path, num_samples=500)
            
        # Ensure model exists and is trained
        model_path = os.path.join("model", "attrition_model.joblib")
        if not os.path.exists(model_path):
            logger.info("Trained ML model not found. Training model...")
            train_attrition_model(dataset_path, "model")
            
        # Load dataset and seed first 120 employees
        df = pd.read_csv(dataset_path)
        seed_limit = min(120, len(df))
        
        logger.info(f"Seeding database with {seed_limit} employee records...")
        
        for idx, row in df.head(seed_limit).iterrows():
            emp_id = row["EmployeeID"]
            
            if get_employee_by_id(db, emp_id):
                continue
                
            emp_create = EmployeeCreate(
                id=emp_id,
                name=f"Employee {idx + 1}",
                email=f"employee{idx + 1}@attrisense.com",
                age=int(row["Age"]),
                gender=row["Gender"],
                marital_status=row["MaritalStatus"],
                distance_from_home=int(row["DistanceFromHome"]),
                department=row["Department"],
                job_role=row["JobRole"],
                job_level=int(row["JobLevel"]),
                monthly_income=int(row["MonthlyIncome"]),
                years_at_company=int(row["YearsAtCompany"]),
                years_in_current_role=int(row["YearsInCurrentRole"]),
                years_since_last_promotion=int(row["YearsSinceLastPromotion"]),
                performance_rating=int(row["PerformanceRating"]),
                job_satisfaction=int(row["JobSatisfaction"]),
                work_life_balance=int(row["WorkLifeBalance"]),
                training_hours=int(row["TrainingHours"]),
                overtime=row["Overtime"],
                status="Active",
                location="HQ",
                manager_name="N/A"
            )
            create_employee(db, emp_create)
            
        logger.info("Database seeded successfully with model predictions calculated.")
    except Exception as e:
        logger.error(f"Seeding failed: {str(e)}")
    finally:
        db.close()

def check_and_migrate_db_schema():
    """
    Verifies and auto-migrates database columns (e.g. location, manager_name) if missing in existing tables.
    """
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "employees" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("employees")]
            with engine.begin() as conn:
                if "location" not in columns:
                    logger.info("Auto-migrating employees table: adding 'location' column...")
                    conn.execute(text("ALTER TABLE employees ADD COLUMN location VARCHAR DEFAULT 'HQ'"))
                if "manager_name" not in columns:
                    logger.info("Auto-migrating employees table: adding 'manager_name' column...")
                    conn.execute(text("ALTER TABLE employees ADD COLUMN manager_name VARCHAR DEFAULT 'N/A'"))
    except Exception as e:
        logger.warning(f"Database schema auto-migration check notice: {str(e)}")

@app.on_event("startup")
def startup_event():
    # 1. Create tables if they don't exist
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Check and migrate database columns
    check_and_migrate_db_schema()
    
    # 3. Seed database
    seed_database()

    # 4. Warm up model cache
    logger.info("Warming up predictive ML model cache...")

    try:
        from backend.app.services.prediction_service import get_model_data
        get_model_data()
        logger.info("ML model pre-loaded into memory successfully.")
    except Exception as e:
        logger.error(f"Failed to preload ML model on startup: {str(e)}")
