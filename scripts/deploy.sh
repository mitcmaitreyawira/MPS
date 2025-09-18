#!/bin/bash

# Production Deployment Script
# This script handles the deployment of the MPS application to production

set -e  # Exit on any error

# Configuration
APP_NAME="mps-app"
DOCKER_REGISTRY="your-registry.com"  # Replace with your Docker registry
ENVIRONMENT="${1:-production}"  # Default to production, can be overridden
VERSION="${2:-latest}"  # Default to latest, can be overridden

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed or not in PATH"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Run tests before deployment
run_tests() {
    log_info "Running tests before deployment..."
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Run linting
    log_info "Running linting..."
    pnpm run lint
    
    # Run type checking
    log_info "Running type checking..."
    pnpm run type-check
    
    # Run unit tests
    log_info "Running unit tests..."
    pnpm run test
    
    # Run e2e tests
    log_info "Running e2e tests..."
    pnpm run test:e2e
    
    log_success "All tests passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build --target backend-production -t "${DOCKER_REGISTRY}/${APP_NAME}-backend:${VERSION}" .
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build --target frontend-production -t "${DOCKER_REGISTRY}/${APP_NAME}-frontend:${VERSION}" .
    
    log_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."
    
    # Push backend image
    docker push "${DOCKER_REGISTRY}/${APP_NAME}-backend:${VERSION}"
    
    # Push frontend image
    docker push "${DOCKER_REGISTRY}/${APP_NAME}-frontend:${VERSION}"
    
    log_success "Images pushed to registry"
}

# Deploy to environment
deploy() {
    log_info "Deploying to ${ENVIRONMENT} environment..."
    
    case $ENVIRONMENT in
        "production")
            deploy_production
            ;;
        "staging")
            deploy_staging
            ;;
        "development")
            deploy_development
            ;;
        *)
            log_error "Unknown environment: ${ENVIRONMENT}"
            exit 1
            ;;
    esac
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Pull latest images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Run health checks
    run_health_checks
    
    log_success "Production deployment completed"
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging..."
    
    # Use staging docker-compose file if it exists
    COMPOSE_FILE="docker-compose.staging.yml"
    if [ ! -f "$COMPOSE_FILE" ]; then
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    docker-compose -f "$COMPOSE_FILE" pull
    docker-compose -f "$COMPOSE_FILE" up -d
    
    sleep 20
    run_health_checks
    
    log_success "Staging deployment completed"
}

# Deploy to development
deploy_development() {
    log_info "Deploying to development..."
    
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    docker-compose -f docker-compose.dev.yml up -d
    
    sleep 15
    run_health_checks
    
    log_success "Development deployment completed"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check backend health
    local backend_url="http://localhost:3000/health"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$backend_url" > /dev/null; then
            log_success "Backend health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Backend health check failed after $max_attempts attempts"
            exit 1
        fi
        
        log_info "Backend health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 2
        ((attempt++))
    done
    
    # Check frontend health (if not development)
    if [ "$ENVIRONMENT" != "development" ]; then
        local frontend_url="http://localhost:80/health"
        if curl -f -s "$frontend_url" > /dev/null; then
            log_success "Frontend health check passed"
        else
            log_warning "Frontend health check failed, but continuing..."
        fi
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # This is a simplified rollback - in production, you'd want more sophisticated rollback logic
    docker-compose down
    
    # Pull previous version (you'd need to implement version tracking)
    # docker-compose pull
    
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Cleanup completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment process for ${APP_NAME} to ${ENVIRONMENT} environment (version: ${VERSION})"
    
    # Trap errors and run cleanup
    trap 'log_error "Deployment failed!"; cleanup; exit 1' ERR
    
    check_prerequisites
    
    # Skip tests for development environment
    if [ "$ENVIRONMENT" != "development" ]; then
        run_tests
    fi
    
    # Skip image building and pushing for development environment
    if [ "$ENVIRONMENT" != "development" ]; then
        build_images
        
        # Only push to registry if not local deployment
        if [ "$DOCKER_REGISTRY" != "localhost" ] && [ "$DOCKER_REGISTRY" != "local" ]; then
            push_images
        fi
    fi
    
    deploy
    
    cleanup
    
    log_success "Deployment completed successfully!"
    log_info "Application is now running on ${ENVIRONMENT} environment"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Backend API: http://localhost:3000"
        log_info "Frontend: http://localhost:80"
    elif [ "$ENVIRONMENT" = "development" ]; then
        log_info "Backend API: http://localhost:3000"
        log_info "Frontend: http://localhost:5173"
        log_info "MongoDB Express: http://localhost:8081"
        log_info "Redis Commander: http://localhost:8082"
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [environment] [version]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (production|staging|development) [default: production]"
    echo "  version        Version tag for Docker images [default: latest]"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy to production with latest version"
    echo "  $0 staging                  # Deploy to staging with latest version"
    echo "  $0 production v1.2.3       # Deploy to production with version v1.2.3"
    echo "  $0 development              # Deploy to development environment"
    echo ""
    echo "Environment Variables:"
    echo "  DOCKER_REGISTRY            Docker registry URL [default: your-registry.com]"
    echo "  SKIP_TESTS                 Skip running tests [default: false]"
}

# Handle command line arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
    exit 0
fi

# Run main function
main "$@"