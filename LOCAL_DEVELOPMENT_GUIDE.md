# MPS Classroom Management - Local Development Guide

This guide will help you set up and run the MPS Classroom Management system locally for development.

## 🏗️ Architecture Overview

The MPS system consists of three main components:

- **Frontend**: React + TypeScript + Vite (Port 5173)
- **Backend**: NestJS + TypeScript (Port 3001)
- **Database**: MongoDB + Redis (Ports 27017, 6379)

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (v9.9.0 or higher) - Install with `npm install -g pnpm`
- **Docker** & **Docker Compose** - [Download here](https://www.docker.com/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
pnpm run dev:setup

# Start both frontend and backend
pnpm run dev
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Databases**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d mongodb redis
   ```

3. **Build Shared Package**
   ```bash
   pnpm run build:shared
   ```

4. **Start Backend**
   ```bash
   pnpm run dev:backend
   ```

5. **Start Frontend** (in a new terminal)
   ```bash
   pnpm run dev:frontend
   ```

## 🌐 Service URLs

Once everything is running, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/v1
- **API Documentation**: http://localhost:3001/api/docs (Swagger)
- **MongoDB**: mongodb://localhost:27017 (admin/password)
- **Redis**: localhost:6379 (password: redispassword)

## 👤 Default Test Accounts

The system comes with pre-configured test accounts:

| Role  | Email           | Password | Description        |
|-------|-----------------|----------|--------------------|
| Admin | admin@mps.com   | admin123 | System Administrator |
| User  | test@mps.com    | test123  | Regular User       |

## 🔧 Environment Configuration

The system uses environment variables for configuration. Key files:

- **Root**: `.env` - Main configuration
- **Backend**: `apps/backend/.env` - Backend-specific settings
- **Frontend**: `apps/frontend/.env` - Frontend-specific settings

### Key Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# Frontend
VITE_API_URL=http://localhost:3001/api/v1

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🛠️ Development Commands

### Root Level Commands

```bash
# Setup development environment
pnpm run dev:setup

# Start all services in parallel
pnpm run dev

# Start individual services
pnpm run dev:backend
pnpm run dev:frontend

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Docker Commands

```bash
# Start databases only
docker-compose -f docker-compose.dev.yml up -d mongodb redis

# Start all services with Docker
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001  # or :5173, :27017, :6379
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Restart databases
   docker-compose -f docker-compose.dev.yml restart mongodb redis
   
   # Check database logs
   docker-compose -f docker-compose.dev.yml logs mongodb
   ```

3. **Frontend Can't Connect to Backend**
   - Verify `VITE_API_URL` in `apps/frontend/.env`
   - Check backend is running on port 3001
   - Verify CORS settings in backend

4. **Build Errors**
   ```bash
   # Clean and reinstall dependencies
   pnpm run clean
   pnpm install
   
   # Rebuild shared package
   pnpm run build:shared
   ```

### Health Checks

```bash
# Check backend health
curl http://localhost:3001/health

# Check MongoDB connection
mongosh "mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin"

# Check Redis connection
redis-cli -h localhost -p 6379 -a redispassword ping
```

## 📁 Project Structure

```
mps_launch/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   ├── .env          # Backend environment
│   │   └── package.json
│   └── frontend/         # React frontend
│       ├── src/
│       ├── .env          # Frontend environment
│       └── package.json
├── packages/
│   └── shared/           # Shared types and utilities
├── scripts/              # Database and utility scripts
├── docker-compose.yml    # Production Docker config
├── docker-compose.dev.yml # Development Docker config
├── .env                  # Root environment config
├── dev-setup.sh         # Automated setup script
└── package.json         # Root package.json
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run backend tests
pnpm run test:backend

# Run frontend tests
pnpm run test:frontend

# Run tests with coverage
pnpm run test:coverage

# Run E2E tests
pnpm run test:e2e
```

## 🔄 Database Management

### MongoDB

```bash
# Connect to MongoDB
mongosh "mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin"

# View collections
show collections

# Query users
db.users.find().pretty()
```

### Redis

```bash
# Connect to Redis
redis-cli -h localhost -p 6379 -a redispassword

# View all keys
keys *

# Get a value
get <key>
```

## 🚀 Production Deployment

For production deployment, see:
- `docker-compose.yml` - Production Docker configuration
- `Dockerfile` - Multi-stage Docker build
- Environment variables in `.env.example`

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the logs: `docker-compose -f docker-compose.dev.yml logs`
3. Ensure all prerequisites are installed
4. Try the automated setup script: `pnpm run dev:setup`

---

**Happy coding! 🎉**