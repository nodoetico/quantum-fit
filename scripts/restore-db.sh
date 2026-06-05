#!/bin/bash
# Restore script for QuantumFit PostgreSQL database
# Usage: ./restore-db.sh <backup-file>

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 ./backups/quantumfit_20260301_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_URL="${DATABASE_URL:-postgresql://quantumfit:password123@localhost:5432/quantumfit}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "[$(date)] Starting restore from: ${BACKUP_FILE}"
echo "[$(date)] WARNING: This will overwrite the existing database!"

read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

DB_HOST=$(echo "${DB_URL}" | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo "${DB_URL}" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "${DB_URL}" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "${DB_URL}" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
export PGPASSWORD=$(echo "${DB_URL}" | sed -n 's/.*:\([^@]*\)@.*/\1/p')

# Decompress and restore
gunzip -c "${BACKUP_FILE}" | pg_restore \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --verbose \
    2>&1

echo "[$(date)] Restore complete!"
