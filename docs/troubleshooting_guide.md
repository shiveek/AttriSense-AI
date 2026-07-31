# AttriSense AI - Troubleshooting Guide

This guide identifies typical operational incident behaviors and details recovery runbooks.

## 1. Latency Spike on First Predictions (Cold Start)
* **Symptom**: The first API request to `/api/predict/` after container launch takes > 5 seconds to respond.
* **Problem**: The Random Forest ML model file is large (6.6MB) and takes time to load from disk into the Python joblib cache.
* **Remedy**: We have implemented automatic warm-up preloading. The FastAPI startup event pre-loads the model cache during initialization. Ensure that `on_event("startup")` hooks run fully and verify that logs report: `INFO:AttriSenseAI:ML model pre-loaded into memory successfully.`

## 2. PostgreSQL Connection Timeouts
* **Symptom**: API endpoints return 500 errors. Logging reports: `sqlalchemy.exc.TimeoutError: QueuePool limit of size 15 overflow 25 reached.`
* **Problem**: Too many database sessions are kept open, exhausting the pool.
* **Remedy**:
  1. Confirm that DB sessions are properly closed. The `get_db` dependency utilizes a `finally` block:
     ```python
     def get_db():
         db = SessionLocal()
         try:
             yield db
         finally:
             db.close()
     ```
  2. Increase pool parameters in `connection.py` (see Operations Guide).
  3. Inspect PostgreSQL running client queries:
     ```sql
     SELECT pid, query, state, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE state != 'idle';
     ```

## 3. Worker Retraining Task Failures
* **Symptom**: Model retraining status logs report `MODEL_RETRAIN_FAILED`. Celery task logs report `Redis ConnectionError`.
* **Problem**: The Celery worker cannot connect to Redis or the worker has run out of memory during scikit-learn fitting calculations.
* **Remedy**:
  1. Verify Redis is running and reachable:
     ```bash
     docker-compose exec redis redis-cli ping
     ```
  2. Verify host memory allocation. Scikit-learn Random Forest model fits training datasets in RAM. If training memory crashes, increase swap memory allocations on the host VM, or decrease trees parameter `n_estimators=100` inside `pipeline.py`.

## 4. CORS Request Blocked
* **Symptom**: Browser console logs report: `Access to XMLHttpRequest at ... has been blocked by CORS policy.`
* **Problem**: The browser blocks requesting origin because it is not matching the server's allow list.
* **Remedy**: Update the `ALLOWED_ORIGINS` environment variable in the `.env` file to include your exact frontend schema and domain. Example: `ALLOWED_ORIGINS=https://app.attrisense.com` (Ensure there are no trailing slashes `/` in the domain string).
