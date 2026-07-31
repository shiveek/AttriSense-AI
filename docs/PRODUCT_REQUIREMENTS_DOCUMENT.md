# Product Requirements Document (PRD)

## Project Name: AttriSense AI
### Tagline: *Predict • Understand • Retain*

---

## 1. Executive Summary
AttriSense AI is an enterprise Workforce Intelligence SaaS Platform engineered to help C-suite executives, HR leaders, and managers predict employee attrition, analyze retention drivers using Explainable AI (SHAP), simulate policy interventions, and automate talent retention strategies.

---

## 2. Product Objectives & Target Audience

### Primary Objectives
1. Reduce unwanted voluntary employee turnover by up to 25%.
2. Demystify opaque machine learning predictions through localized TreeSHAP feature attributions.
3. Enable real-time "What-If" policy simulations to calculate immediate ROI on retention interventions.
4. Streamline HR operations with automated PDF executive briefings and Excel reports.

### Target Customer Segments
- **Enterprise HR Leaders & Chief Human Resources Officers (CHROs)**
- **People Analytics & Workforce Operations Desks**
- **Department Managers & Team Leads**
- **Enterprise SaaS IT Administrators**

---

## 3. Key Feature Specifications

### 3.1 Predictive Attrition Engine
- **Model**: Scikit-Learn Random Forest Ensemble Classifier (100 estimators).
- **Features Evaluated (16)**: Age, Gender, Marital Status, Distance From Home, Department, Job Role, Job Level, Monthly Income, Years at Company, Years in Current Role, Years Since Last Promotion, Performance Rating, Job Satisfaction, Work-Life Balance, Training Hours, Overtime Status.
- **Risk Categorization**:
  - `High Risk`: Risk score $\ge 70\%$
  - `Medium Risk`: Risk score $35\% - 69\%$
  - `Low Risk`: Risk score $< 35\%$

### 3.2 Explainable AI (SHAP TreeExplainer)
- **Local Attribution**: Computes marginal contribution scores for each attribute for individual employee predictions.
- **Visual Breakdown**: Dynamic waterfall chart and force metrics displaying positive driver factors (e.g. Overtime $+24\%$) vs. protective factors (e.g. High Income $-12\%$).

### 3.3 Interactive "What-If" Policy Simulator
- Real-time sandbox allowing managers to adjust parameters (salary slider, overtime toggle, job level, satisfaction scale) and calculate instant recalculations of predicted risk score.

### 3.4 Executive Analytics Dashboard
- Aggregated organizational metrics: total employees, average attrition risk percentage, department risk breakdown bar chart, attrition risk trend line chart, high-risk watchlist table.

### 3.5 Asynchronous Reporting System
- Celery worker queues backed by Redis to offload heavy PDF slide deck and Excel spreadsheet generation to background workers, saving output artifacts to AWS S3.

### 3.6 Enterprise Security & Governance
- OAuth2 JWT bearer token authentication.
- Cryptographic password hashing (`passlib[bcrypt]`).
- Fine-grained Role-Based Access Control (RBAC: `Admin`, `HR_Manager`, `Analyst`, `User`).
- Immutable compliance audit logging (`AuditLog` database entity).

---

## 4. Non-Functional Requirements (NFRs)

- **Performance**: Sub-100ms API response latency for cached predictions; sub-500ms for fresh SHAP computations.
- **Availability**: 99.9% uptime target backed by Docker containerization and health probe endpoints.
- **Accessibility**: WCAG 2.1 AA compliant styling, high-contrast dark theme, and keyboard navigability.
- **Security**: OWASP Top 10 compliance, SQL injection immunity via SQLAlchemy ORM, strict CORS policies, and rate-limiting.
