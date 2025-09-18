# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline setup for the MPS (MERN + NestJS Professional System) application.

## Overview

The CI/CD pipeline is designed to:
- Automatically test code changes
- Ensure code quality through linting and type checking
- Build and deploy applications to different environments
- Monitor application health and performance
- Provide rollback capabilities

## Pipeline Components

### 1. GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

The main CI/CD pipeline includes:

#### Jobs:
- **test**: Runs on multiple Node.js versions (18.x, 20.x) with MongoDB and Redis services
- **security**: Performs security audits and dependency checks
- **deploy-staging**: Deploys to staging environment on `develop` branch
- **deploy-production**: Deploys to production environment on `main` branch

#### Features:
- Parallel testing across Node.js versions
- Comprehensive test suite (unit, integration, e2e)
- Code quality checks (linting, type checking)
- Security vulnerability scanning
- Automated deployment with health checks
- Coverage reporting with Codecov integration

### 2. Docker Configuration

#### Multi-stage Dockerfile
- **base**: Common base with Node.js and pnpm
- **shared-builder**: Builds shared packages
- **backend-builder**: Builds backend application
- **frontend-builder**: Builds frontend application
- **backend-production**: Production-ready backend image
- **frontend-production**: Production-ready frontend with Nginx

#### Docker Compose Files
- `docker-compose.yml`: Production deployment
- `docker-compose.dev.yml`: Development environment with hot reloading

### 3. Git Hooks (Husky)

#### Pre-commit Hook
- Runs `lint-staged` to check staged files
- Ensures code quality before commits

#### Commit Message Hook
- Enforces conventional commit message format
- Uses `@commitlint/config-conventional`

### 4. Scripts

#### Deployment Script (`scripts/deploy.sh`)
- Automated deployment to different environments
- Health checks and rollback capabilities
- Docker image building and registry management

#### Health Check Script (`scripts/health-check.sh`)
- Monitors application and service health
- Provides detailed health reports
- Supports multiple retry attempts

## Environment Setup

### Prerequisites

1. **Node.js** (18.x or 20.x)
2. **pnpm** (8.x)
3. **Docker** and **Docker Compose**
4. **Git** with Husky hooks

### Installation

```bash
# Install dependencies
pnpm install

# Setup git hooks
pnpm run prepare

# Install additional CI/CD tools
pnpm add -D @commitlint/cli @commitlint/config-conventional husky lint-staged audit-ci better-npm-audit
```

## Usage

### Local Development

```bash
# Start development environment
pnpm run docker:up:dev

# View logs
pnpm run docker:logs:dev

# Stop development environment
pnpm run docker:down:dev
```

### Testing

```bash
# Run all tests
pnpm run test

# Run backend tests only
pnpm run test:backend

# Run frontend tests only
pnpm run test:frontend

# Run e2e tests
pnpm run test:e2e

# Run with coverage
pnpm run test:coverage
```

### Code Quality

```bash
# Lint code
pnpm run lint

# Type check
pnpm run type-check

# Format code
pnpm run format

# Check formatting
pnpm run format:check
```

### Building

```bash
# Build all applications
pnpm run build

# Build backend only
pnpm run build:backend

# Build frontend only
pnpm run build:frontend
```

### Docker Operations

```bash
# Build Docker images
pnpm run docker:build

# Build specific images
pnpm run docker:build:backend
pnpm run docker:build:frontend

# Start production environment
pnpm run docker:up

# View production logs
pnpm run docker:logs
```

### Deployment

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to development
./scripts/deploy.sh development

# Deploy specific version
./scripts/deploy.sh production v1.2.3
```

### Health Monitoring

```bash
# Check application health
./scripts/health-check.sh

# Verbose health check
./scripts/health-check.sh --verbose

# Custom timeout and retries
./scripts/health-check.sh --timeout 15 --retries 5
```

## Environment Variables

### CI/CD Pipeline

```bash
# GitHub Secrets (configure in repository settings)
CODECOV_TOKEN=your_codecov_token
DOCKER_REGISTRY_URL=your_registry_url
DOCKER_REGISTRY_USERNAME=your_username
DOCKER_REGISTRY_PASSWORD=your_password
```

### Application

```bash
# Backend
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mps_db
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:80

# Frontend
VITE_API_URL=http://localhost:3000
```

## Deployment Environments

### Development
- **Purpose**: Local development and testing
- **Features**: Hot reloading, debug ports, admin UIs
- **Services**: Backend, Frontend, MongoDB, Redis, Mongo Express, Redis Commander
- **URLs**:
  - Backend: http://localhost:3000
  - Frontend: http://localhost:5173
  - MongoDB Express: http://localhost:8081
  - Redis Commander: http://localhost:8082

### Staging
- **Purpose**: Pre-production testing
- **Features**: Production-like environment, automated deployment from `develop` branch
- **Services**: Backend, Frontend, MongoDB, Redis
- **Deployment**: Automatic on push to `develop` branch

### Production
- **Purpose**: Live application
- **Features**: Optimized builds, health monitoring, rollback capabilities
- **Services**: Backend, Frontend, MongoDB, Redis
- **Deployment**: Automatic on push to `main` branch
- **URLs**:
  - Backend: http://localhost:3000
  - Frontend: http://localhost:80

## Monitoring and Logging

### Health Checks
- Automated health checks for all services
- HTTP endpoint monitoring
- Database connectivity checks
- Docker container health status
- System metrics collection

### Logging
- Structured logging with Winston
- Container logs via Docker
- Application performance monitoring
- Error tracking and alerting

### Metrics
- Response time monitoring
- Cache hit/miss ratios
- Database query performance
- System resource usage

## Security

### Automated Security Scanning
- Dependency vulnerability scanning with `audit-ci`
- Enhanced audit reports with `better-npm-audit`
- Regular security updates

### Best Practices
- Non-root container execution
- Secrets management via environment variables
- Network isolation with Docker networks
- Health check endpoints for monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   pnpm run build:backend
   pnpm run build:frontend
   
   # Clean and rebuild
   pnpm run clean
   pnpm install
   pnpm run build
   ```

2. **Test Failures**
   ```bash
   # Run tests with verbose output
   pnpm run test -- --verbose
   
   # Run specific test suite
   pnpm run test:backend -- --testNamePattern="specific test"
   ```

3. **Docker Issues**
   ```bash
   # Check container status
   docker ps -a
   
   # View container logs
   docker logs container_name
   
   # Restart services
   docker-compose restart
   ```

4. **Health Check Failures**
   ```bash
   # Run detailed health check
   ./scripts/health-check.sh --verbose
   
   # Check individual services
   curl http://localhost:3000/health
   curl http://localhost:80/health
   ```

### Debug Commands

```bash
# Check service status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec frontend sh

# Check network connectivity
docker network ls
docker network inspect mps-network
```

## Contributing

### Workflow
1. Create feature branch from `develop`
2. Make changes and commit (follows conventional commits)
3. Push branch and create pull request
4. CI pipeline runs automatically
5. Merge to `develop` triggers staging deployment
6. Merge to `main` triggers production deployment

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Code Quality Standards
- ESLint configuration for consistent code style
- Prettier for code formatting
- TypeScript for type safety
- Jest for testing
- Comprehensive test coverage

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate secrets quarterly
- Monitor and optimize performance
- Review and update documentation
- Backup and disaster recovery testing

### Dependency Updates
```bash
# Check outdated packages
pnpm run deps:outdated

# Update dependencies
pnpm run deps:update

# Run security audit
pnpm run audit
```

## Support

For issues and questions:
1. Check this documentation
2. Review GitHub Actions logs
3. Check application logs
4. Run health checks
5. Contact the development team

---

**Note**: This CI/CD setup is designed for scalability and maintainability. Regular updates and monitoring ensure optimal performance and security.