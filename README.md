# MERN + NestJS Professional Template

A production-ready, enterprise-grade template combining MongoDB, Express, React, Node.js with NestJS backend. Built with security-first principles, comprehensive testing, and scalability in mind.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0
- Docker >= 20.10 (optional)

### Installation

```bash
# Clone the template
git clone <your-repo> my-project
cd my-project

# Install dependencies
npm run setup

# Start development environment
npm run dev
```

### With Docker (Recommended)

```bash
# Start all services
npm run docker:dev

# Stop all services
npm run docker:down
```

## 🔒 DevLock System

The DevLock system prevents multiple backend instances from running simultaneously, eliminating conflicts with uploads, sessions, and database operations.

### Features
- **Port Preflight Check**: Fails fast if port 3002 is already in use
- **PID Lockfile**: Prevents multiple host processes on the same machine
- **Redis Mutex**: Blocks host-vs-Docker duplication across processes/hosts
- **Docker Profiles**: Backend container only starts when explicitly requested

### Development Workflows

#### Local Development (pnpm)
```bash
# Start backend only (recommended for development)
pnpm run dev:backend

# Or start full development environment
pnpm run dev
```

#### Docker-Only Development
```bash
# Start infrastructure only (MongoDB + Redis)
docker-compose -f docker-compose.dev.yml up mongodb redis

# Start backend with explicit profile
docker-compose -f docker-compose.dev.yml --profile backend up

# Or start everything with full profile
docker-compose -f docker-compose.dev.yml --profile full up
```

#### Production Deployment
```bash
# Start with backend profile (recommended)
docker-compose --profile backend up -d

# Or start everything
docker-compose --profile full up -d
```

### Configuration

DevLock is controlled via environment variables in `.env`:

```bash
# DevLock System
DEVLOCK=true                    # Enable/disable DevLock (default: true)
PORT=3002                       # Backend port (default: 3002)
REDIS_HOST=localhost            # Redis host for mutex
REDIS_PORT=6379                 # Redis port
REDIS_PASSWORD=redispassword    # Redis password
```

### Disabling DevLock

To temporarily disable DevLock (not recommended for development):

```bash
# In .env file
DEVLOCK=false

# Or as environment variable
DEVLOCK=false pnpm run dev:backend
```

### Troubleshooting

#### Port Already in Use
```bash
# Find process using port 3002
lsof -ti:3002

# Kill the process
kill -9 $(lsof -ti:3002)

# Or use a different port
PORT=3003 pnpm run dev:backend
```

#### Stale PID Lock
```bash
# Remove stale lockfile
rm -f /tmp/mps-backend.pid

# Restart backend
pnpm run dev:backend
```

#### Redis Unavailable
```bash
# Start Redis with Docker
docker-compose -f docker-compose.dev.yml up redis -d

# Or disable DevLock temporarily
DEVLOCK=false pnpm run dev:backend

# Check Redis connection
redis-cli -h localhost -p 6379 -a redispassword ping
```

#### Multiple Instances Still Running
```bash
# Check all Node.js processes
ps aux | grep node

# Kill all Node.js processes (use with caution)
pkill -f "node.*backend"

# Check Docker containers
docker ps | grep backend

# Stop Docker backend
docker-compose -f docker-compose.dev.yml stop backend-dev
```

## 📁 Project Structure

```
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # React application
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── ui/              # Shared UI components
│   └── config/          # Shared configurations
├── docker/              # Docker configurations
├── docs/               # Documentation
└── scripts/            # Build and deployment scripts
```

## 🛡️ Security Features

- **Multi-layer security framework** with 99.9% account compromise risk reduction
- **JWT authentication** with refresh token rotation
- **Multi-factor authentication** (TOTP/backup codes)
- **Rate limiting** (100 requests/minute per IP)
- **Input validation** and XSS protection
- **RBAC authorization** with resource-level permissions
- **Security headers** and CORS configuration
- **Dependency vulnerability scanning**

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage (85%+ required)
npm run test:coverage

# Run specific app tests
npm run test --filter=backend
npm run test --filter=frontend
```

### Data Persistence Testing

The project includes specialized CI scripts to verify data persistence across server restarts and deployments:

#### `test-data-persistence.js`

Tests that user data persists after server restarts by:
1. Creating a test user via API with admin authentication
2. Verifying the user exists in the database
3. Simulating server restart (stopping/starting backend)
4. Verifying the user still exists after restart
5. Cleaning up test data

```bash
# Run data persistence test
node test-data-persistence.js

# Prerequisites:
# - Backend server running on localhost:3000
# - Admin user (ADMIN001) configured
# - MongoDB accessible
```

#### `verify-data-persistence.js`

Comprehensive verification of the MPS system's data persistence capabilities:
1. **Docker Volume Persistence** - Checks MongoDB persistent volumes
2. **Database Connection** - Verifies MongoDB health and connectivity
3. **User Data Integrity** - Confirms existing user data is accessible
4. **Backup Capability** - Tests backup script functionality
5. **Restore Capability** - Validates restore operations
6. **Environment Configuration** - Checks persistence-related settings

```bash
# Run persistence verification
node verify-data-persistence.js

# Prerequisites:
# - Docker containers running (mps-mongodb-dev)
# - Backup scripts available in ./scripts/
# - Proper MongoDB authentication configured
```

#### CI Integration

These scripts are designed for CI/CD pipelines and can be integrated into GitHub Actions:

```yaml
# Example CI step
- name: Test Data Persistence
  run: |
    npm run docker:dev &
    sleep 30  # Wait for services to start
    node test-data-persistence.js
    node verify-data-persistence.js
```

#### Test Results

Both scripts provide detailed output with:
- ✅ Success indicators for passed tests
- ❌ Error indicators for failed tests
- 📋 Informational logs with timestamps
- 🧪 Test progress indicators
- Overall persistence score (verify-data-persistence.js)

#### Troubleshooting

**Common Issues:**
- **Admin login fails**: Ensure ADMIN001 user exists with password 'Admin123!'
- **Database connection fails**: Check MongoDB container status and credentials
- **CSRF token issues**: Verify backend CSRF protection is properly configured
- **Docker volume not found**: Ensure MongoDB container uses named volumes

**Debug Commands:**
```bash
# Check backend health
curl http://localhost:3000/api/v1/health/db

# Verify MongoDB container
docker ps | grep mongodb

# Check Docker volumes
docker volume ls | grep mongodb

# Test admin login manually
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nisn":"ADMIN001","password":"Admin123!"}'
```

## 🧱 Backend Conventions and Notes

- **Audit logs**: Use `AuditLogsService.create(dto, userId, userName)` everywhere.
  - Example:
    ```ts
    await auditLogsService.create({ action: 'user_update', details: { userId } }, currentUser.id, currentUser.name);
    ```
- **Cache invalidation**: `CacheService` supports both methods for compatibility:
  - `deletePattern(pattern: string)` — used by `DataSyncService` for broad invalidations.
  - `invalidatePattern(pattern: string)` — legacy alias used by helpers like `UserCacheHelper`.
  - Prefer `deletePattern` in new code; keep `invalidatePattern` for backward compatibility.

## 🏗️ Building

```bash
# Build all applications
npm run build

# Build specific application
npm run build --filter=backend
```

## 📋 Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format all code
- `npm run typecheck` - Type check all code
- `npm run docker:dev` - Start with Docker (development)
- `npm run docker:prod` - Start with Docker (production)

## 🔧 Configuration

### Unified Environment Configuration

The project uses a **unified configuration approach** where a single `.env` file works for both development and production environments:

```bash
cp .env.example .env
```

#### Configuration Features:

- **Single source of truth**: One `.env` file for all environments
- **Docker integration**: Both `docker-compose.yml` and `docker-compose.dev.yml` use the same variables
- **Environment variable substitution**: All Docker services use `${VAR:-default}` syntax
- **Fallback defaults**: Safe defaults for development, customizable for production

#### Development Setup:

```bash
# Copy and use defaults
cp .env.example .env

# Start with Docker
npm run docker:dev

# Or start locally
npm run dev
```

#### Production Setup:

**Critical**: Update these variables for production:
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` - Use strong, unique secrets
- `MONGO_INITDB_ROOT_PASSWORD` - Change default database password
- `REDIS_PASSWORD` - Change default Redis password
- `MONGODB_URI` - Update if using external MongoDB
- `CORS_ORIGIN` - Set to your frontend domain
- `SMTP_*` settings - Configure email functionality
- `FORCE_HTTPS=true` - Enable HTTPS enforcement

#### Configuration Architecture:

The configuration is automatically shared between:
- **Backend API** (`apps/backend/`) - Reads from `.env`
- **Frontend application** (`apps/frontend/`) - Uses `VITE_*` prefixed variables
- **Docker services** (`docker-compose.yml` & `docker-compose.dev.yml`) - Environment variable substitution
- **Database initialization** (`scripts/mongo-init.js`) - Uses Docker environment variables

### Key Configuration Files

- `turbo.json` - Monorepo build configuration
- `docker-compose.*.yml` - Docker service definitions
- `.github/workflows/` - CI/CD pipeline configuration
- `packages/config/` - Shared configuration utilities

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run docker:prod
```

### CI/CD Pipeline

The template includes GitHub Actions workflows for:
- Code quality checks (linting, testing)
- Security vulnerability scanning
- Automated deployments to staging/production
- Database migrations

## 📖 Documentation

- [Backend API Documentation](./apps/backend/README.md)
- [Frontend Application](./apps/frontend/README.md)
- [Security Guide](./docs/security.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with modern tools and best practices from the community:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://reactjs.org/) - UI library
- [MongoDB](https://www.mongodb.com/) - Document database
- [Turbo](https://turbo.build/) - Monorepo build system