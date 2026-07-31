# AttriSense AI - Production Deployment Guide

This guide details steps to compile, package, and deploy AttriSense AI in production SaaS environments.

## System Prerequisites
- **Docker**: Version 24.0.0 or higher.
- **Docker Compose**: V2 specification.
- **Hardware Profile**: 
  - Minimum: 2 vCPU, 4GB RAM, 20GB SSD.
  - Recommended: 4 vCPU, 8GB RAM, 50GB SSD (to handle ML training calculations).

## 1. Environment Configurations
Prepare a production `.env` file in the root workspace folder:

```bash
# General
ENV=production

# Database (PostgreSQL)
DATABASE_URL=postgresql://attrisense_user:COMPLEX_SECURE_PASSWORD@db:5432/attrisense_db

# Redis Caching & Queue Broker
REDIS_URL=redis://redis:6379/0

# Security (JWT Secrets)
# Generate using: openssl rand -hex 32
JWT_SECRET_KEY=9a15f0190538ad823485d95d5272a8c39de08ef28325a75908ef1c05d7b275bf

# CORS Settings (Comma-separated allowed domains)
ALLOWED_ORIGINS=https://app.attrisense.com,https://api.attrisense.com
```

## 2. Containerized Rollout
Run the following build command to prepare and launch the microservice cluster:

```bash
# Build and run containers in background
docker-compose up --build -d
```

Verify service containers status:

```bash
docker-compose ps
```

The output should show:
- `attrisense_db`: Running (healthy)
- `attrisense_redis`: Running
- `attrisense_backend`: Running (healthy)
- `attrisense_worker`: Running
- `attrisense_frontend`: Running

## 3. Database Initial Seed & Migrations
The database schema compiles automatically during the backend container startup event. The seed process creates:
- Default roles: `Admin`, `HR_Manager`, `Analyst`, `User`
- Default administrator: `admin@attrisense.com` / password `admin123` (Admins must immediately rotate this password on first login).

To check table schemas in PostgreSQL container:

```bash
docker-compose exec db psql -U attrisense_user -d attrisense_db -c "\dt"
```

## 4. Production Domain & SSL (Nginx Proxy)
In standard SaaS environments, we recommend mounting an Nginx gateway or Cloudflare tunnel in front of `attrisense_frontend` (Port 80) and `attrisense_backend` (Port 8000) to handle:
- SSL/TLS terminates (Port 443 with Let's Encrypt).
- Gzip static asset compressions.
- Rate limiting (restricting request threshold counts).
