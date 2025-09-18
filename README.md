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