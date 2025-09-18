#!/usr/bin/env bash
set -euo pipefail

# MPS Backup Script
# Backs up MongoDB and Redis from local Docker containers (preferred) or host tools if available.

TIMESTAMP="${TIMESTAMP:-$(date +%Y%m%d_%H%M%S)}"
BACKUP_ROOT="${BACKUP_ROOT:-$(pwd)/backups}"
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
MONGO_CONTAINER="${MONGO_CONTAINER:-mps-mongodb-dev}"
REDIS_CONTAINER="${REDIS_CONTAINER:-mps-redis-dev}"
MONGO_DB="${MONGO_DB:-mps_db_unified}"

mkdir -p "$BACKUP_DIR"
echo "[backup] Target directory: $BACKUP_DIR"

have_docker() { command -v docker >/dev/null 2>&1; }
container_running() { docker ps --format '{{.Names}}' | grep -q "^$1$"; }

# Mongo backup
backup_mongo() {
  echo "[backup] MongoDB: starting backup"
  if have_docker && container_running "$MONGO_CONTAINER"; then
    echo "[backup] Using Docker container $MONGO_CONTAINER for mongodump"
    docker exec "$MONGO_CONTAINER" sh -c "mongodump --username admin --password password --authenticationDatabase admin --db '$MONGO_DB' --archive=/tmp/mongo.archive" >/dev/null
    docker cp "$MONGO_CONTAINER:/tmp/mongo.archive" "$BACKUP_DIR/mongo.archive"
    docker exec "$MONGO_CONTAINER" sh -c "rm -f /tmp/mongo.archive" || true
  elif command -v mongodump >/dev/null 2>&1; then
    local uri="${MONGODB_URI:-mongodb://localhost:27017/$MONGO_DB}"
    echo "[backup] Using host mongodump against $uri"
    mongodump --uri "$uri" --archive="$BACKUP_DIR/mongo.archive"
  else
    echo "[backup][WARN] No Docker container '$MONGO_CONTAINER' or host mongodump found; skipping Mongo backup"
    return 0
  fi
  echo "[backup] MongoDB: backup complete -> $BACKUP_DIR/mongo.archive"
}

# Redis backup
backup_redis() {
  echo "[backup] Redis: starting backup"
  if have_docker && container_running "$REDIS_CONTAINER"; then
    echo "[backup] Using Docker container $REDIS_CONTAINER for redis dump"
    docker exec "$REDIS_CONTAINER" sh -c "redis-cli SAVE" >/dev/null || true
    docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$BACKUP_DIR/redis_dump.rdb"
  elif command -v redis-cli >/dev/null 2>&1; then
    local host="${REDIS_HOST:-localhost}"; local port="${REDIS_PORT:-6379}"; local pass="${REDIS_PASSWORD:-}"
    local auth=""; [ -n "$pass" ] && auth="-a $pass"
    echo "[backup] Using host redis-cli against $host:$port"
    redis-cli -h "$host" -p "$port" $auth SAVE || true
    if [ -f /var/lib/redis/dump.rdb ]; then
      cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_dump.rdb"
    else
      echo "[backup][WARN] Could not locate dump.rdb on host; skipping Redis dump copy"
    fi
  else
    echo "[backup][WARN] No Docker container '$REDIS_CONTAINER' or host redis-cli found; skipping Redis backup"
    return 0
  fi
  echo "[backup] Redis: backup complete -> $BACKUP_DIR/redis_dump.rdb"
}

# Package backup
package_backup() {
  echo "[backup] Packaging backup"
  local tarball="$BACKUP_ROOT/mps_backup_${TIMESTAMP}.tar.gz"
  tar -C "$BACKUP_DIR" -czf "$tarball" .
  echo "[backup] Created archive: $tarball"
}

backup_mongo
backup_redis
package_backup

echo "[backup] DONE"