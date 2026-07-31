# AttriSense AI - Operations Guide

This guide details daily administrative procedures, telemetry log collection, and model management activities for system administrators.

## 1. Log Aggregation
AttriSense AI logs structural runtime audits to the stdout and stderr streams of containers.

To follow API request logs:

```bash
docker-compose logs -f backend
```

Example request log format:
```text
INFO:AttriSenseSRE:IP: 192.168.1.50 | GET /api/employees/ | Status: 200 | Duration: 14.50ms
```

To follow background training workers:

```bash
docker-compose logs -f worker
```

## 2. Background Model Retraining Schedule
The model is retrained asynchronously. Retraining merges the primary `employee_attrition.csv` base dataset with any CRUD additions or status modifications (e.g. employee resignation updates) recorded in the database.

Retraining can be triggered via two methods:
1. **API Post**: Send a POST request to `/api/models/retrain` (Requires Admin role credentials).
2. **Cron Job (System Orchestration)**: Set up a crontab in the host server to execute a nightly rebuild:
   ```bash
   0 2 * * * curl -X POST -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" http://localhost:8000/api/models/retrain
   ```

## 3. Database Connection Scaling
In heavy load environments (> 10,000 requests/minute), SQLAlchemy PostgreSQL connection parameters can be adjusted in [connection.py](file:///c:/Users/DELL/OneDrive/Desktop/AttriSense-AI/backend/app/database/connection.py):
- `pool_size`: Defaults to 15 connections. Can be raised to 50.
- `max_overflow`: Defaults to 25. Can be raised to 50.

Keep the database host engine limit configured (`max_connections = 150` in postgresql.conf).

## 4. Telemetry Metrics Integration
Expose server telemetry by integrating Prometheus monitoring metrics. The health probe endpoint `/api/health/` reports overall health indices, which can be scraped by monitoring agents every 30 seconds.
- Alert threshold: Raise pager alerts if `/api/health/` reports `"status": "degraded"` or fails to respond within 5 seconds.
