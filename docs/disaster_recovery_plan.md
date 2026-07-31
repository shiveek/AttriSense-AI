# AttriSense AI - Disaster Recovery Plan

This plan details recovery procedures for system failures, data corruption incidents, and host outages.

## 1. SLA & Recovery Commitments
- **Recovery Point Objective (RPO)**: 24 Hours (Maximum data loss since last backup).
- **Recovery Time Objective (RTO)**: 2 Hours (Maximum time allowed to restore platform access).

## 2. Backup Strategy
Production workforce data recorded in PostgreSQL must be backed up daily.

### Automated Backup Script
Set up a nightly cron job on the host server to execute a pg_dump backup and upload it to secure encrypted AWS S3 storage:

```bash
#!/bin/bash
# backup_db.sh
BACKUP_DIR="/var/backups/attrisense"
TIMESTAMP=$(date +%F_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

# Execute compressed postgres dump
docker-compose exec -T db pg_dump -U attrisense_user attrisense_db | gzip > ${BACKUP_FILE}

# Prune backups older than 30 days
find ${BACKUP_DIR} -type f -mtime +30 -name "*.sql.gz" -delete
```

## 3. Restoring System Data
In the event of database corruption or deletion:

1. Stop application containers to prevent active writes:
   ```bash
   docker-compose stop backend worker
   ```
2. Re-create database schemas by dropping and recreating the database:
   ```bash
   docker-compose exec db psql -U attrisense_user -d postgres -c "DROP DATABASE attrisense_db;"
   docker-compose exec db psql -U attrisense_user -d postgres -c "CREATE DATABASE attrisense_db OWNER attrisense_user;"
   ```
3. Inject the SQL backup file:
   ```bash
   gunzip -c /var/backups/attrisense/db_backup_TARGET_TIMESTAMP.sql.gz | docker-compose exec -T db psql -U attrisense_user -d attrisense_db
   ```
4. Start backend services:
   ```bash
   docker-compose start backend worker
   ```

## 4. Rollback Plan
If a new application image deployment introduces catastrophic bugs:

1. Revert Git repository state to the previous stable release tag:
   ```bash
   git checkout tags/v1.0.4
   ```
2. Force rebuild and start using stable image layers:
   ```bash
   docker-compose up --build -d
   ```
3. Validate overall health checks return `healthy` (HTTP 200).
