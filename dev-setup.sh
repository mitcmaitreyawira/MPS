#!/bin/bash

# MPS Classroom Management - Local Development Setup Script
# This script sets up and starts all components for local development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :"$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

print_status "🚀 Starting MPS Classroom Management Development Environment"
echo "================================================================="

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists pnpm; then
    print_error "pnpm is not installed. Please install pnpm and try again."
    print_status "You can install pnpm with: npm install -g pnpm"
    exit 1
fi

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_success "All prerequisites are installed!"

# Check if ports are available
print_status "Checking port availability..."

if port_in_use 27017; then
    print_warning "Port 27017 (MongoDB) is already in use. This might be okay if MongoDB is already running."
fi

if port_in_use 6379; then
    print_warning "Port 6379 (Redis) is already in use. This might be okay if Redis is already running."
fi

if port_in_use 3001; then
    print_error "Port 3001 (Backend) is already in use. Please stop the service using this port."
    exit 1
fi

if port_in_use 5173; then
    print_error "Port 5173 (Frontend) is already in use. Please stop the service using this port."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
pnpm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully!"

# Start databases with Docker
print_status "Starting databases (MongoDB & Redis)..."
docker-compose -f docker-compose.dev.yml up -d mongodb redis

if [ $? -ne 0 ]; then
    print_error "Failed to start databases"
    exit 1
fi

# Wait for databases to be ready
wait_for_service localhost 27017 "MongoDB"
wait_for_service localhost 6379 "Redis"

print_success "Databases are running!"

# Build shared package
print_status "Building shared package..."
pnpm run build:shared

if [ $? -ne 0 ]; then
    print_error "Failed to build shared package"
    exit 1
fi

print_success "Shared package built successfully!"

print_success "🎉 Development environment setup complete!"
echo "================================================================="
print_status "Services Status:"
echo "  📊 MongoDB:  http://localhost:27017 (admin/password)"
echo "  🔴 Redis:    localhost:6379 (password: redispassword)"
echo ""
print_status "To start the application services:"
echo "  🖥️  Backend:  pnpm run dev:backend (will run on http://localhost:3001)"
echo "  🌐 Frontend: pnpm run dev:frontend (will run on http://localhost:5173)"
echo ""
print_status "Or start both together:"
echo "  🚀 All services: pnpm run dev"
echo ""
print_status "To stop databases:"
echo "  🛑 docker-compose -f docker-compose.dev.yml down"
echo ""
print_status "Default test accounts:"
echo "  👤 Admin: admin@mps.com / admin123"
echo "  👤 User:  test@mps.com / test123"
echo "================================================================="