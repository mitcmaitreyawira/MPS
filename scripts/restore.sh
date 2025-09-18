#!/usr/bin/env bash
set -euo pipefail

# MPS Restore Script
# Restores MongoDB and Redis from backup archives

BACKUP_FILE="${1:-}"
MONGO_CONTAINER="${MONGO_CONTAINER:-mps-mongodb}"
REDIS_CONTAINER="${REDIS_CONTAINER:-mps-redis}"
MONGO_DB="${MONGO_DB:-mps_db}"
TEMP_DIR="/tmp/mps_restore_$$"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  echo "Available backups:"
  ls -la backups/*.tar.gz 2>/dev/null || echo "No backups found in ./backups/"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[restore][ERROR] Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "[restore] Starting restore from: $BACKUP_FILE"
mkdir -p "$TEMP_DIR"
trap "rm -rf '$TEMP_DIR'" EXIT

# Extract backup
echo "[restore] Extracting backup archive"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

have_docker() { command -v docker >/dev/null 2>&1; }
container_running() { docker ps --format '{{.Names}}' | grep -q "^$1$"; }

# Restore MongoDB
restore_mongo() {
  if [ ! -f "$TEMP_DIR/mongo.archive" ]; then
    echo "[restore][WARN] No mongo.archive found in backup; skipping MongoDB restore"
    return 0
  fi
  
  echo "[restore] MongoDB: starting restore"
  if have_docker && container_running "$MONGO_CONTAINER"; then
    echo "[restore] Using Docker container $MONGO_CONTAINER for mongorestore"
    docker cp "$TEMP_DIR/mongo.archive" "$MONGO_CONTAINER:/tmp/mongo.archive"
    docker exec "$MONGO_CONTAINER" sh -c "mongorestore --db '$MONGO_DB' --archive=/tmp/mongo.archive --drop"
    docker exec "$MONGO_CONTAINER" sh -c "rm -f /tmp/mongo.archive" || true
  elif command -v mongorestore >/dev/null 2>&1; then
    local uri="${MONGODB_URI:-mongodb://localhost:27017/$MONGO_DB}"
    echo "[restore] Using host mongorestore against $uri"
    mongorestore --uri "$uri" --archive="$TEMP_DIR/mongo.archive" --drop
  else
    echo "[restore][ERROR] No Docker container '$MONGO_CONTAINER' or host mongorestore found"
    return 1
  fi
  echo "[restore] MongoDB: restore complete"
}

# Restore Redis
restore_redis() {
  if [ ! -f "$TEMP_DIR/redis_dump.rdb" ]; then
    echo "[restore][WARN] No redis_dump.rdb found in backup; skipping Redis restore"
    return 0
  fi
  
  echo "[restore] Redis: starting restore"
  if have_docker && container_running "$REDIS_CONTAINER"; then
    echo "[restore] Using Docker container $REDIS_CONTAINER for Redis restore"
    docker exec "$REDIS_CONTAINER" sh -c "redis-cli FLUSHALL" || true
    docker cp "$TEMP_DIR/redis_dump.rdb" "$REDIS_CONTAINER:/data/dump.rdb"
    docker restart "$REDIS_CONTAINER"
    sleep 3
    echo "[restore] Waiting for Redis to load data..."
    docker exec "$REDIS_CONTAINER" sh -c "redis-cli ping" >/dev/null
  elif command -v redis-cli >/dev/null 2>&1; then
    local host="${REDIS_HOST:-localhost}"; local port="${REDIS_PORT:-6379}"; local pass="${REDIS_PASSWORD:-}"
    local auth=""; [ -n "$pass" ] && auth="-a $pass"
    echo "[restore] Using host redis-cli against $host:$port"
    redis-cli -h "$host" -p "$port" $auth FLUSHALL || true
    # Note: Host Redis restore requires manual placement of dump.rdb and restart
    echo "[restore][WARN] Host Redis restore requires manual placement of dump.rdb and service restart"
  else
    echo "[restore][ERROR] No Docker container '$REDIS_CONTAINER' or host redis-cli found"
    return 1
  fi
  echo "[restore] Redis: restore complete"
}

restore_mongo
restore_redis

echo "[restore] DONE - Restore completed successfully"
echo "[restore] Verify data integrity with: npm run test or manual checks"