#!/usr/bin/env bash
set -euo pipefail

# MPS Logging & Metrics Collection Script
# Centralized logging setup and metrics collection for monitoring

ACTION="${1:-status}"
LOG_DIR="${LOG_DIR:-$(pwd)/logs}"
METRICS_DIR="${METRICS_DIR:-$(pwd)/metrics}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
SERVICES=("backend" "frontend" "mongodb" "redis")

usage() {
  echo "Usage: $0 <action>"
  echo "Actions:"
  echo "  setup     - Initialize logging directories and rotation"
  echo "  collect   - Collect current metrics and logs"
  echo "  rotate    - Rotate and compress old logs"
  echo "  cleanup   - Clean up logs older than $RETENTION_DAYS days"
  echo "  status    - Show logging and metrics status"
  echo "  tail      - Tail all service logs"
  exit 1
}

log() { echo "[logging][$(date '+%H:%M:%S')] $*"; }
error() { echo "[logging][ERROR] $*" >&2; exit 1; }

have_docker() { command -v docker >/dev/null 2>&1; }
container_exists() { docker ps -a --format '{{.Names}}' | grep -q "^$1$"; }

# Setup logging infrastructure
setup_logging() {
  log "Setting up logging infrastructure"
  
  # Create directories
  mkdir -p "$LOG_DIR"/{backend,frontend,mongodb,redis,system}
  mkdir -p "$METRICS_DIR"/{daily,hourly}
  
  # Create logrotate configuration
  cat > "$LOG_DIR/logrotate.conf" << 'EOF'
# MPS Log Rotation Configuration
/path/to/mps/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    postrotate
        # Restart services if needed
        docker kill -s USR1 mps-backend 2>/dev/null || true
    endscript
}
EOF
  
  # Create metrics collection cron job template
  cat > "$METRICS_DIR/crontab.template" << 'EOF'
# MPS Metrics Collection
# Collect metrics every 5 minutes
*/5 * * * * /path/to/mps/scripts/logging-metrics.sh collect >/dev/null 2>&1
# Rotate logs daily at 2 AM
0 2 * * * /path/to/mps/scripts/logging-metrics.sh rotate >/dev/null 2>&1
# Cleanup old logs weekly
0 3 * * 0 /path/to/mps/scripts/logging-metrics.sh cleanup >/dev/null 2>&1
EOF
  
  log "Logging setup completed"
  log "Directories created: $LOG_DIR, $METRICS_DIR"
  log "Configure cron with: crontab $METRICS_DIR/crontab.template"
}

# Collect metrics and logs
collect_metrics() {
  local timestamp=$(date '+%Y%m%d_%H%M%S')
  local metrics_file="$METRICS_DIR/daily/metrics_$timestamp.json"
  
  log "Collecting metrics at $timestamp"
  
  # System metrics
  local system_metrics="{"
  system_metrics+="\"timestamp\": \"$(date -Iseconds)\","
  system_metrics+="\"uptime\": \"$(uptime | tr -d '\n')\","
  system_metrics+="\"load_avg\": \"$(uptime | awk -F'load average:' '{print $2}' | tr -d ' ')\","
  system_metrics+="\"memory\": {"
  
  if command -v free >/dev/null 2>&1; then
    local mem_info=$(free -m | awk 'NR==2{printf "{\"total\":%s,\"used\":%s,\"free\":%s,\"percent\":%.1f}", $2,$3,$4,$3*100/$2}')
    system_metrics+="$mem_info"
  else
    # macOS alternative
    local mem_total=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024)}')
    local mem_pressure=$(memory_pressure | grep 'System-wide memory free percentage' | awk '{print $5}' | tr -d '%' || echo "0")
    local mem_used=$(echo "$mem_total * (100 - $mem_pressure) / 100" | bc -l | awk '{print int($1)}')
    system_metrics+="{\"total\":$mem_total,\"used\":$mem_used,\"free\":$(($mem_total - $mem_used)),\"percent\":$(echo "100 - $mem_pressure" | bc)}"
  fi
  
  system_metrics+="},"
  system_metrics+="\"disk\": {"
  local disk_info=$(df -h . | awk 'NR==2{printf "{\"total\":\"%s\",\"used\":\"%s\",\"available\":\"%s\",\"percent\":\"%s\"}", $2,$3,$4,$5}')
  system_metrics+="$disk_info"
  system_metrics+="}"
  
  # Docker container metrics
  if have_docker; then
    system_metrics+=",\"containers\": ["
    local container_metrics=""
    
    for service in "${SERVICES[@]}"; do
      local container_name="mps-$service"
      if container_exists "$container_name"; then
        local stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" "$container_name" 2>/dev/null | tail -1 || echo "")
        if [ -n "$stats" ]; then
          local cpu=$(echo "$stats" | awk '{print $2}' | tr -d '%')
          local mem_usage=$(echo "$stats" | awk '{print $3}')
          local mem_perc=$(echo "$stats" | awk '{print $4}' | tr -d '%')
          local net_io=$(echo "$stats" | awk '{print $5}')
          local block_io=$(echo "$stats" | awk '{print $6}')
          
          [ -n "$container_metrics" ] && container_metrics+=","
          container_metrics+="{\"name\":\"$container_name\",\"cpu\":\"$cpu\",\"memory\":\"$mem_usage\",\"memory_percent\":\"$mem_perc\",\"network\":\"$net_io\",\"disk\":\"$block_io\"}"
        fi
      fi
    done
    
    system_metrics+="$container_metrics]"
  fi
  
  system_metrics+="}"
  
  # Save metrics
  echo "$system_metrics" | jq '.' > "$metrics_file" 2>/dev/null || echo "$system_metrics" > "$metrics_file"
  
  # Collect application logs
  if have_docker; then
    for service in "${SERVICES[@]}"; do
      local container_name="mps-$service"
      if container_exists "$container_name"; then
        local log_file="$LOG_DIR/$service/${service}_$(date '+%Y%m%d').log"
        docker logs --since="5m" "$container_name" >> "$log_file" 2>&1 || true
      fi
    done
  fi
  
  log "Metrics collected: $metrics_file"
}

# Rotate logs
rotate_logs() {
  log "Rotating logs"
  
  for service in "${SERVICES[@]}"; do
    local service_log_dir="$LOG_DIR/$service"
    if [ -d "$service_log_dir" ]; then
      find "$service_log_dir" -name "*.log" -type f -mtime +1 -exec gzip {} \;
      log "Rotated logs for $service"
    fi
  done
  
  # Rotate metrics
  find "$METRICS_DIR/daily" -name "*.json" -type f -mtime +1 -exec gzip {} \;
  
  log "Log rotation completed"
}

# Cleanup old logs
cleanup_logs() {
  log "Cleaning up logs older than $RETENTION_DAYS days"
  
  # Remove old log files
  find "$LOG_DIR" -name "*.log.gz" -type f -mtime +"$RETENTION_DAYS" -delete
  find "$LOG_DIR" -name "*.log" -type f -mtime +"$RETENTION_DAYS" -delete
  
  # Remove old metrics
  find "$METRICS_DIR" -name "*.json.gz" -type f -mtime +"$RETENTION_DAYS" -delete
  find "$METRICS_DIR" -name "*.json" -type f -mtime +"$RETENTION_DAYS" -delete
  
  log "Cleanup completed"
}

# Show status
show_status() {
  log "=== MPS Logging & Metrics Status ==="
  
  echo "Log Directory: $LOG_DIR"
  echo "Metrics Directory: $METRICS_DIR"
  echo "Retention: $RETENTION_DAYS days"
  echo ""
  
  # Disk usage
  echo "Disk Usage:"
  du -sh "$LOG_DIR" 2>/dev/null || echo "  Logs: Not found"
  du -sh "$METRICS_DIR" 2>/dev/null || echo "  Metrics: Not found"
  echo ""
  
  # Recent logs
  echo "Recent Log Files:"
  find "$LOG_DIR" -name "*.log" -type f -mtime -1 2>/dev/null | head -10 || echo "  No recent logs found"
  echo ""
  
  # Container status
  if have_docker; then
    echo "Container Status:"
    for service in "${SERVICES[@]}"; do
      local container_name="mps-$service"
      if container_exists "$container_name"; then
        local status=$(docker ps --filter "name=$container_name" --format "{{.Status}}" | head -1)
        echo "  $container_name: $status"
      else
        echo "  $container_name: Not found"
      fi
    done
  fi
}

# Tail all logs
tail_logs() {
  log "Tailing all service logs (Ctrl+C to stop)"
  
  if have_docker; then
    local containers=""
    for service in "${SERVICES[@]}"; do
      local container_name="mps-$service"
      if container_exists "$container_name"; then
        containers+="$container_name "
      fi
    done
    
    if [ -n "$containers" ]; then
      docker logs -f $containers
    else
      error "No containers found to tail"
    fi
  else
    error "Docker not available for log tailing"
  fi
}

# Main execution
case "$ACTION" in
  "setup")
    setup_logging
    ;;
  "collect")
    collect_metrics
    ;;
  "rotate")
    rotate_logs
    ;;
  "cleanup")
    cleanup_logs
    ;;
  "status")
    show_status
    ;;
  "tail")
    tail_logs
    ;;
  *)
    usage
    ;;
esac