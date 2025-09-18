#!/usr/bin/env bash
set -euo pipefail

# MPS Rollback Script
# Handles deployment rollbacks and service recovery

ROLLBACK_TARGET="${1:-}"
BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"
SERVICES=("backend" "frontend" "mongodb" "redis")

usage() {
  echo "Usage: $0 <rollback_target>"
  echo "Rollback targets:"
  echo "  last-backup    - Restore from most recent backup"
  echo "  previous-image - Rollback Docker images to previous tags"
  echo "  restart-all    - Restart all services (soft recovery)"
  echo "  emergency-stop - Stop all services immediately"
  exit 1
}

[ -z "$ROLLBACK_TARGET" ] && usage

log() { echo "[rollback][$(date '+%H:%M:%S')] $*"; }
error() { echo "[rollback][ERROR] $*" >&2; exit 1; }

have_docker() { command -v docker >/dev/null 2>&1; }
have_compose() { docker compose version >/dev/null 2>&1 || docker-compose --version >/dev/null 2>&1; }
compose_cmd() { docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose"; }

# Health check function
check_service_health() {
  local service="$1"
  local max_attempts=30
  local attempt=1
  
  log "Checking health of $service"
  while [ $attempt -le $max_attempts ]; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
      local health=$(docker inspect --format='{{.State.Health.Status}}' "mps-$service" 2>/dev/null || echo "unknown")
      if [ "$health" = "healthy" ] || [ "$health" = "unknown" ]; then
        log "Service $service is healthy"
        return 0
      fi
    fi
    log "Attempt $attempt/$max_attempts: $service not ready, waiting..."
    sleep 2
    ((attempt++))
  done
  error "Service $service failed health check after $max_attempts attempts"
}

# Rollback to last backup
rollback_last_backup() {
  log "Rolling back to last backup"
  
  local latest_backup
  latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1 || echo "")
  
  if [ -z "$latest_backup" ]; then
    error "No backup files found in $BACKUP_DIR"
  fi
  
  log "Found latest backup: $latest_backup"
  
  # Stop services gracefully
  if have_compose; then
    log "Stopping services"
    $(compose_cmd) -f "$DOCKER_COMPOSE_FILE" down
  fi
  
  # Restore data
  log "Restoring data from backup"
  ./scripts/restore.sh "$latest_backup" || error "Restore failed"
  
  # Restart services
  log "Restarting services"
  if have_compose; then
    $(compose_cmd) -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    for service in "${SERVICES[@]}"; do
      check_service_health "$service"
    done
  fi
  
  log "Rollback to last backup completed"
}

# Rollback Docker images
rollback_previous_image() {
  log "Rolling back to previous Docker images"
  
  # This assumes images are tagged with versions like :v1.0.0, :v1.0.1, etc.
  # In production, you'd maintain a registry of previous working image tags
  
  local backend_image="mps-backend:previous"
  local frontend_image="mps-frontend:previous"
  
  if ! docker image inspect "$backend_image" >/dev/null 2>&1; then
    error "Previous backend image $backend_image not found"
  fi
  
  if ! docker image inspect "$frontend_image" >/dev/null 2>&1; then
    error "Previous frontend image $frontend_image not found"
  fi
  
  log "Stopping current services"
  if have_compose; then
    $(compose_cmd) -f "$DOCKER_COMPOSE_FILE" stop backend frontend
  fi
  
  log "Updating to previous images"
  # Update docker-compose to use previous tags (in production, this would be automated)
  docker tag "$backend_image" mps-backend:latest
  docker tag "$frontend_image" mps-frontend:latest
  
  log "Restarting with previous images"
  if have_compose; then
    $(compose_cmd) -f "$DOCKER_COMPOSE_FILE" up -d backend frontend
    
    check_service_health "backend"
    check_service_health "frontend"
  fi
  
  log "Image rollback completed"
}

# Restart all services
restart_all() {
  log "Performing soft recovery - restarting all services"
  
  if have_compose; then
    log "Restarting Docker Compose stack"
    $(compose_cmd) -f "$DOCKER_COMPOSE_FILE" restart
    
    # Wait for all services to be healthy
    for service in "${SERVICES[@]}"; do
      check_service_health "$service"
    done
  else
    log "Restarting individual containers"
    for service in "${SERVICES[@]}"; do
      if docker ps -a --filter "name=mps-$service" | grep -q "mps-$service"; then
        docker restart "mps-$service"
        check_service_health "$service"
      fi
    done
  fi
  
  log "Service restart completed"
}

# Emergency stop
emergency_stop() {
  log "EMERGENCY STOP - Stopping all services immediately"
  
  if have_compose; then
    $(compose_cmd) -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
  else
    for service in "${SERVICES[@]}"; do
      docker stop "mps-$service" 2>/dev/null || true
    done
  fi
  
  log "Emergency stop completed - all services stopped"
  log "To restart: docker-compose -f $DOCKER_COMPOSE_FILE up -d"
}

# Main rollback logic
case "$ROLLBACK_TARGET" in
  "last-backup")
    rollback_last_backup
    ;;
  "previous-image")
    rollback_previous_image
    ;;
  "restart-all")
    restart_all
    ;;
  "emergency-stop")
    emergency_stop
    ;;
  *)
    error "Unknown rollback target: $ROLLBACK_TARGET"
    ;;
esac

log "Rollback operation '$ROLLBACK_TARGET' completed successfully"