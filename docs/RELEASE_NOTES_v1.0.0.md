# AttriSense AI v1.0.0 Release Notes
### *Predict • Understand • Retain* — Initial Production Release Candidate

We are proud to announce the official **v1.0.0 Release Candidate** of **AttriSense AI**, an enterprise-grade Decision Intelligence and Workforce Analytics SaaS platform.

---

## 🚀 Key Highlights & Capabilities

### 1. Predictive Attrition Engine & Explainable AI (SHAP)
- **Scikit-Learn Random Forest Classifier**: Evaluates 16 core employee metrics to calculate individual flight probabilities ($0.0\% - 100.0\%$) with **89.2% accuracy** and **0.941 ROC AUC**.
- **TreeSHAP Explainer (`shap.TreeExplainer`)**: Computes marginal feature attribution scores for every prediction, rendering localized positive vs. protective risk driver breakdowns.
- **Actionable Retention Strategies**: Auto-synthesizes SHAP output into categorized HR intervention plans across salary, workload, promotion timeline, and mentorship.

### 2. Interactive "What-If" Policy Simulator Sandbox
- Real-time sandbox allowing HR managers to test policy adjustments (raise grants, overtime elimination, job satisfaction scale shifts) with instant recalculated risk output.

### 3. Executive Workforce Analytics & Dashboards
- Interactive dark-mode dashboard featuring departmental attrition heatmaps, tenure degradation curves, and performance vs. satisfaction correlation matrices.

### 4. Asynchronous PDF & Excel Export System
- Background Celery workers backed by Redis queues to offload executive PDF slide deck and multi-sheet Excel report generation to AWS S3.

### 5. Enterprise Security & Access Control
- OAuth2 JWT authentication, `passlib[bcrypt]` password hashing, fine-grained Role-Based Access Control (RBAC), and immutable audit logs.

---

## 📦 Multi-Cloud Deployment Manifests Included
- **Vercel**: `frontend/vercel.json` and root `vercel.json` for edge SPA deployment.
- **Railway / Docker**: `railway.json`, `Dockerfile`, and `docker-compose.yml`.
- **Neon PostgreSQL**: Serverless database configuration with connection pooling.
- **Upstash Redis**: Serverless cache and task queue broker.
- **AWS S3**: Object storage bucket for report exports.

---

## 🔑 Default Credentials
- **Admin Email**: `admin@attrisense.com`
- **Admin Password**: `admin123`
