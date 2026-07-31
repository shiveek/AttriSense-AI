# AttriSense AI - Release Candidate v1.0.0 Known Limitations

This document outlines transparent architectural boundaries and known scope limitations for **AttriSense AI v1.0.0**. These design choices preserve production stability, performance, and deterministic behavior for release candidate validation.

---

## 1. Machine Learning & Predictive Scope

### 1.1 Fixed Synthetic Baseline Dataset (500 Samples)
- **Scope**: The default predictive engine is trained on a synthetic workforce dataset of 500 samples modeled after standard enterprise HR analytics parameters.
- **Impact**: While accuracy ($89.2\%$) and ROC AUC ($0.941$) are high for standard corporate profiles, niche domain behaviors (e.g. specialized medical or military tenure patterns) require custom retraining.
- **Workaround / Solution**: Administrators can trigger model retraining with custom CSV datasets via the Settings panel or Celery background task endpoint.

### 1.2 Static 16-Feature Vector Model Schema
- **Scope**: The Random Forest Classifier and TreeSHAP explainer strictly evaluate 16 core employee metrics (Age, Gender, Marital Status, Distance From Home, Department, Job Role, Job Level, Monthly Income, Years at Company, Years in Current Role, Years Since Last Promotion, Performance Rating, Job Satisfaction, Work-Life Balance, Training Hours, Overtime).
- **Impact**: Additional external features (such as employee commute traffic data or Slack sentiment scores) are not included in v1.0.0.

---

## 2. Infrastructure & Real-Time Sync Scope

### 2.1 Single-Tenant Data Isolation Default
- **Scope**: AttriSense AI v1.0.0 runs in a single-tenant workspace configuration.
- **Impact**: Enterprise SaaS multi-tenancy requiring dynamic database schema switching per customer domain (`tenant_id` partitioning) is targeted for v2.0.0.

### 2.2 Polling-Based Asynchronous Report Status
- **Scope**: Report generation tasks (PDF/Excel exports via Celery) utilize polling to verify completion.
- **Impact**: Real-time WebSocket push notifications for completed background jobs are omitted in favor of robust HTTP status polling.

---

## 3. Supported Environment Boundaries

- **Browser Support**: Chrome 110+, Safari 16+, Firefox 115+, Edge 110+.
- **Node.js Runtime**: v18.x or v20.x (React 19 Vite SPA compilation).
- **Python Runtime**: 3.10, 3.11, or 3.12.
- **Database Support**: PostgreSQL 14+ or SQLite 3.35+ (development fallback).
