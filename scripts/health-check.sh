#!/bin/bash

# Health Check Script
# This script monitors the health of the MPS application services

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:80}"
MONGODB_HOST="${MONGODB_HOST:-localhost}"
MONGODB_PORT="${MONGODB_PORT:-27017}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
TIMEOUT="${TIMEOUT:-10}"
RETRIES="${RETRIES:-3}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    if [ "$VERBOSE" = "true" ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if a service is reachable
check_http_service() {
    local service_name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    log_info "Checking $service_name at $url"
    
    local attempt=1
    while [ $attempt -le $RETRIES ]; do
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$TIMEOUT" "$url" 2>/dev/null || echo "000")
        
        if [ "$status_code" = "$expected_status" ]; then
            log_success "$service_name is healthy (HTTP $status_code)"
            return 0
        fi
        
        if [ $attempt -eq $RETRIES ]; then
            log_error "$service_name is unhealthy (HTTP $status_code) after $RETRIES attempts"
            return 1
        fi
        
        log_info "$service_name check attempt $attempt/$RETRIES failed (HTTP $status_code), retrying..."
        sleep 2
        ((attempt++))
    done
}

# Check MongoDB connection
check_mongodb() {
    log_info "Checking MongoDB at $MONGODB_HOST:$MONGODB_PORT"
    
    local attempt=1
    while [ $attempt -le $RETRIES ]; do
        if command -v mongosh &> /dev/null; then
            # Use mongosh if available
            if mongosh --host "$MONGODB_HOST" --port "$MONGODB_PORT" --eval "db.runCommand({ping: 1})" --quiet &> /dev/null; then
                log_success "MongoDB is healthy"
                return 0
            fi
        elif command -v mongo &> /dev/null; then
            # Fallback to legacy mongo client
            if mongo --host "$MONGODB_HOST" --port "$MONGODB_PORT" --eval "db.runCommand({ping: 1})" --quiet &> /dev/null; then
                log_success "MongoDB is healthy"
                return 0
            fi
        else
            # Use netcat as fallback
            if nc -z "$MONGODB_HOST" "$MONGODB_PORT" &> /dev/null; then
                log_success "MongoDB port is reachable"
                return 0
            fi
        fi
        
        if [ $attempt -eq $RETRIES ]; then
            log_error "MongoDB is unhealthy after $RETRIES attempts"
            return 1
        fi
        
        log_info "MongoDB check attempt $attempt/$RETRIES failed, retrying..."
        sleep 2
        ((attempt++))
    done
}

# Check Redis connection
check_redis() {
    log_info "Checking Redis at $REDIS_HOST:$REDIS_PORT"
    
    local attempt=1
    while [ $attempt -le $RETRIES ]; do
        if command -v redis-cli &> /dev/null; then
            # Use redis-cli if available
            if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping &> /dev/null; then
                log_success "Redis is healthy"
                return 0
            fi
        else
            # Use netcat as fallback
            if nc -z "$REDIS_HOST" "$REDIS_PORT" &> /dev/null; then
                log_success "Redis port is reachable"
                return 0
            fi
        fi
        
        if [ $attempt -eq $RETRIES ]; then
            log_error "Redis is unhealthy after $RETRIES attempts"
            return 1
        fi
        
        log_info "Redis check attempt $attempt/$RETRIES failed, retrying..."
        sleep 2
        ((attempt++))
    done
}

# Check Docker containers
check_docker_containers() {
    log_info "Checking Docker containers"
    
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not available, skipping container checks"
        return 0
    fi
    
    local containers=("mps-backend" "mps-frontend" "mps-mongodb" "mps-redis")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            local status
            status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
            
            case $status in
                "healthy")
                    log_success "Container $container is healthy"
                    ;;
                "unhealthy")
                    log_error "Container $container is unhealthy"
                    all_healthy=false
                    ;;
                "starting")
                    log_warning "Container $container is starting"
                    ;;
                "unknown")
                    log_warning "Container $container health status unknown"
                    ;;
                *)
                    log_warning "Container $container status: $status"
                    ;;
            esac
        else
            log_warning "Container $container is not running"
        fi
    done
    
    if [ "$all_healthy" = "true" ]; then
        return 0
    else
        return 1
    fi
}

# Get system metrics
get_system_metrics() {
    log_info "Collecting system metrics"
    
    # CPU usage
    if command -v top &> /dev/null; then
        local cpu_usage
        cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "N/A")
        echo "CPU Usage: ${cpu_usage}%"
    fi
    
    # Memory usage
    if command -v vm_stat &> /dev/null; then
        local memory_pressure
        memory_pressure=$(memory_pressure 2>/dev/null | grep "System-wide memory free percentage" | awk '{print $5}' | sed 's/%//' || echo "N/A")
        echo "Memory Free: ${memory_pressure}%"
    fi
    
    # Disk usage
    if command -v df &> /dev/null; then
        local disk_usage
        disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//' 2>/dev/null || echo "N/A")
        echo "Disk Usage: ${disk_usage}%"
    fi
    
    # Load average
    if command -v uptime &> /dev/null; then
        local load_avg
        load_avg=$(uptime | awk -F'load average:' '{print $2}' | sed 's/^[ \t]*//' 2>/dev/null || echo "N/A")
        echo "Load Average: ${load_avg}"
    fi
}

# Check application-specific endpoints
check_application_endpoints() {
    log_info "Checking application-specific endpoints"
    
    # Check backend API endpoints
    local endpoints=(
        "$BACKEND_URL/health"
        "$BACKEND_URL/health/info"
        "$BACKEND_URL/api/auth/status"
    )
    
    local all_healthy=true
    
    for endpoint in "${endpoints[@]}"; do
        if check_http_service "API $(basename "$endpoint")" "$endpoint"; then
            continue
        else
            all_healthy=false
        fi
    done
    
    # Check frontend (if not in development mode)
    if [ "$FRONTEND_URL" != "http://localhost:5173" ]; then
        if ! check_http_service "Frontend" "$FRONTEND_URL"; then
            all_healthy=false
        fi
    fi
    
    return $([ "$all_healthy" = "true" ] && echo 0 || echo 1)
}

# Generate health report
generate_report() {
    local overall_status="$1"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo ""
    echo "=== MPS Application Health Report ==="
    echo "Timestamp: $timestamp"
    echo "Overall Status: $([ "$overall_status" -eq 0 ] && echo "HEALTHY" || echo "UNHEALTHY")"
    echo ""
    
    if [ "$VERBOSE" = "true" ]; then
        echo "=== System Metrics ==="
        get_system_metrics
        echo ""
    fi
    
    echo "=== Service URLs ==="
    echo "Backend API: $BACKEND_URL"
    echo "Frontend: $FRONTEND_URL"
    echo "MongoDB: $MONGODB_HOST:$MONGODB_PORT"
    echo "Redis: $REDIS_HOST:$REDIS_PORT"
    echo ""
}

# Main health check function
main() {
    local overall_status=0
    
    echo "Starting MPS Application Health Check..."
    echo ""
    
    # Check all services
    check_mongodb || overall_status=1
    check_redis || overall_status=1
    check_application_endpoints || overall_status=1
    
    # Check Docker containers if available
    check_docker_containers || overall_status=1
    
    # Generate report
    generate_report $overall_status
    
    # Exit with appropriate code
    exit $overall_status
}

# Show usage information
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -v, --verbose           Enable verbose output"
    echo "  -t, --timeout SECONDS   Set connection timeout [default: 10]"
    echo "  -r, --retries COUNT     Set retry count [default: 3]"
    echo ""
    echo "Environment Variables:"
    echo "  BACKEND_URL             Backend API URL [default: http://localhost:3000]"
    echo "  FRONTEND_URL            Frontend URL [default: http://localhost:80]"
    echo "  MONGODB_HOST            MongoDB host [default: localhost]"
    echo "  MONGODB_PORT            MongoDB port [default: 27017]"
    echo "  REDIS_HOST              Redis host [default: localhost]"
    echo "  REDIS_PORT              Redis port [default: 6379]"
    echo "  TIMEOUT                 Connection timeout in seconds [default: 10]"
    echo "  RETRIES                 Number of retries [default: 3]"
    echo "  VERBOSE                 Enable verbose output [default: false]"
    echo ""
    echo "Exit Codes:"
    echo "  0    All services are healthy"
    echo "  1    One or more services are unhealthy"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -r|--retries)
            RETRIES="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run main function
main