# AttriSense AI - Production Rollback Strategy

This document specifies standard operating procedures (SOP) for rolling back production deployments in the event of critical regressions, failed database migrations, or infrastructure failures.

---

## 1. Fast Rollback Triggers
Perform immediate automated or manual rollback if:
- **API Error Spike**: HTTP 5xx error rate exceeds $1.0\%$ over a 5-minute window.
- **Latency Degraded**: $p99$ response latency exceeds $2.0$ seconds for core endpoints (`/api/predictions/`).
- **Database Connection Pool Exhaustion**: Connection failures exceed $5\%$ threshold.
- **ML Engine Malfunction**: SHAP TreeExplainer throws uncaught runtime exceptions during inference.

---

## 2. Frontend Rollback (Vercel)
Vercel keeps immutable instant deployment history for all commits.

### Instant Rollback via Vercel CLI
```bash
# List previous successful production deployments
vercel ls --prod

# Instantly alias production domain to previous stable deployment URL
vercel alias set <previous-deployment-url>.vercel.app app.attrisense.com
```

---

## 3. Backend API Gateway & Celery Rollback (Railway / Docker)

### Rollback via Railway Dashboard / CLI
```bash
# Redeploy the previous Git commit hash on Railway
railway redeploy --deployment-id <previous-successful-deployment-id>
```

### Rollback via Docker Compose
```bash
# 1. Pull previous stable tagged container images
docker-compose pull

# 2. Restart services with zero-downtime rolling update
docker-compose up -d --no-deps backend worker
```

---

## 4. Database Rollback Strategy (Alembic & Neon PostgreSQL)

### Step 4.1: Alembic Schema Migration Downgrade
```bash
# Downgrade database schema to previous revision ID
alembic downgrade -1
```

### Step 4.2: Neon Point-in-Time Restore (PITR)
If data corruption occurred:
1. Open Neon Console -> Branches -> **Create Branch from PITR**.
2. Select timestamp immediately prior to deployment failure (e.g. 5 minutes ago).
3. Update `DATABASE_URL` environment variable to point to restored branch.
4. Restart API gateway instances.

---

## 5. Post-Rollback Post-Mortem Checklist
- [ ] Verify HTTP 200 OK status on `https://api.attrisense.com/api/health/`.
- [ ] Confirm JWT user login and authorization tokens operate correctly.
- [ ] Execute test prediction to verify Random Forest model loads into memory cache.
- [ ] Log incident in SRE Incident Manager with root cause analysis (RCA).
