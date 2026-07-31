# AttriSense AI - API Documentation

AttriSense AI exposes REST endpoints for workforce directory management, predictive calculations, and auditing.

## 1. Authentication

### Public Sign Up
* **POST** `/api/auth/register`
* **Request Body**:
  ```json
  {
    "email": "manager@company.com",
    "password": "securepassword123",
    "full_name": "Sarah Connor",
    "role_name": "HR_Manager"
  }
  ```
  *(Note: Public registration restricts assigning the Admin role; default values default to HR_Manager, Analyst, or User)*
* **Response (201 Created)**:
  ```json
  {
    "id": 2,
    "email": "manager@company.com",
    "full_name": "Sarah Connor",
    "role": { "id": 2, "name": "HR_Manager", "description": "HR_Manager system permission role" },
    "is_active": true,
    "created_at": "2026-07-31T13:43:00"
  }
  ```

### Sign In (OAuth2 Token Request)
* **POST** `/api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "manager@company.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

---

## 2. Directory CRUD

### List Employees
* **GET** `/api/employees/`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Query Parameters**:
  - `search` (Search name/id/email)
  - `department` (Filter e.g. IT, Sales)
  - `risk_level` (Filter e.g. High, Medium, Low)
  - `limit` (Pagination limit, default 100)
* **Response (200 OK)**:
  ```json
  {
    "employees": [
      {
        "id": "EMP001",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "department": "IT",
        "job_role": "Software Engineer",
        "risk_score": 12.5,
        "risk_level": "Low",
        "last_predicted_at": "2026-07-31T13:43:00"
      }
    ],
    "total": 1
  }
  ```

---

## 3. AI Predictions & Explanations

### Run Parametric Prediction
* **POST** `/api/predict/`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body**:
  ```json
  {
    "age": 30,
    "gender": "Male",
    "marital_status": "Single",
    "distance_from_home": 15,
    "department": "IT",
    "job_role": "Software Engineer",
    "job_level": 2,
    "monthly_income": 4500,
    "years_at_company": 3,
    "years_in_current_role": 2,
    "years_since_last_promotion": 1,
    "performance_rating": 3,
    "job_satisfaction": 2,
    "work_life_balance": 2,
    "training_hours": 24,
    "overtime": "Yes"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "probability": 72.8,
    "risk_level": "High",
    "confidence": 92.5,
    "contributions": [
      { "feature": "Overtime", "value": "Yes", "contribution": 0.185 },
      { "feature": "JobSatisfaction", "value": 2, "contribution": 0.124 }
    ],
    "recommendations": [
      "Overtime Reduction: Limit weekly overtime hours, review work distribution, or introduce overtime compensation.",
      "Stay Interview: Conduct a dedicated check-in to identify role stressors."
    ]
  }
  ```

---

## 4. Diagnostics & System health

### Health Check Probes
* **GET** `/api/health/`
* **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "database": "online",
    "ml_engine": "online",
    "model_details": {
      "algorithm": "Random Forest Classifier",
      "accuracy": 0.892,
      "trained_at": "2026-07-31T13:43:00",
      "samples": 500
    },
    "environment": "production"
  }
  ```
