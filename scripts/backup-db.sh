#!/bin/bash
# Backup script for QuantumFit PostgreSQL database
# Usage: ./backup-db.sh [output-directory]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/quantumfit_${TIMESTAMP}.sql.gz"
DB_URL="${DATABASE_URL:-postgresql://quantumfit:password123@localhost:5432/quantumfit}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup..."
echo "[$(date)] Database: ${DB_URL}"

# Extract connection details from DATABASE_URL
DB_HOST=$(echo "${DB_URL}" | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo "${DB_URL}" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "${DB_URL}" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "${DB_URL}" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
export PGPASSWORD=$(echo "${DB_URL}" | sed -n 's/.*:\([^@]*\)@.*/\1/p')

pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    --format=custom \
    --verbose \
    --no-owner \
    --no-acl \
    2> "${BACKUP_DIR}/backup_${TIMESTAMP}.log" | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup saved: ${BACKUP_FILE}"
echo "[$(date)] Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Cleanup old backups
find "${BACKUP_DIR}" -name "quantumfit_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "backup_*.log" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete. Retention: ${RETENTION_DAYS} days"

# Optional: Send to S3 or other remote storage
# if [ -n "${AWS_S3_BUCKET:-}" ]; then
#   aws s3 cp "${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/database-backups/"
# fi
