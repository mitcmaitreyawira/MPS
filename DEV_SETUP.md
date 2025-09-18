# MPS Development Environment Setup Guide

This guide provides complete instructions for setting up and running the MPS (Gamified Classroom Management) application in a local development environment.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** (v9.9.0 or higher)
- **Docker Desktop** (for database services)
- **Git**

### 1. Start Database Services

```bash
# Start MongoDB and Redis using Docker Compose
docker-compose -f docker-compose.dev.yml up -d mongodb redis

# Verify services are running
docker ps
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

### 3. Start Backend Server

```bash
# Navigate to backend and start development server
cd apps/backend
pnpm run dev
```

The backend will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/v1/docs

### 4. Start Frontend Application

```bash
# In a new terminal, navigate to frontend and start development server
cd apps/frontend
pnpm run dev
```

The frontend will be available at:
- **Web Application**: http://localhost:5173

### 5. Create Demo Accounts

```bash
# Create demo user accounts for testing
cd apps/backend
node create-demo-accounts.js
```

## 🔑 Demo Login Credentials

### Admin Accounts (Full System Access)
| NISN | Password | Name | Role |
|------|----------|------|------|
| ADMIN001 | Admin123! | System Administrator | admin |
| ADMIN002 | Admin123! | Super Admin | admin |

### Teacher Accounts (Classroom Management)
| NISN | Password | Name | Role | Subject |
|------|----------|------|------|----------|
| TEACH001 | Teacher123! | John Smith | teacher | Mathematics |
| TEACH002 | Teacher123! | Sarah Johnson | teacher | English |
| TEACH003 | Teacher123! | Michael Brown | teacher | Science |

### Student Accounts (Learning Interface)
| NISN | Password | Name | Role | Grade | Class |
|------|----------|------|------|-------|-------|
| 1001234567 | Student123! | Alice Wilson | student | 10 | 10A |
| 1001234568 | Student123! | Bob Davis | student | 10 | 10B |
| 1001234569 | Student123! | Charlie Miller | student | 11 | 11A |
| 1001234570 | Student123! | Diana Garcia | student | 11 | 11B |

### Parent Accounts (Student Monitoring)
| NISN | Password | Name | Role |
|------|----------|------|------|
| PARENT001 | Parent123! | Robert Wilson | parent |
| PARENT002 | Parent123! | Linda Davis | parent |
| PARENT003 | Parent123! | James Miller | parent |

## 🛠️ Development Tools

### Available Scripts

```bash
# Root level commands
pnpm dev              # Start all services in parallel
pnpm build            # Build all applications
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier

# Backend specific
cd apps/backend
pnpm run dev          # Start backend in watch mode
pnpm run build        # Build backend for production
pnpm run test         # Run backend tests
pnpm run test:e2e     # Run end-to-end tests

# Frontend specific
cd apps/frontend
pnpm run dev          # Start frontend development server
pnpm run build        # Build frontend for production
pnpm run test         # Run frontend tests
```

### Database Management

```bash
# View database with MongoDB Express (optional)
docker-compose -f docker-compose.dev.yml up -d mongo-express
# Access at: http://localhost:8081
# Username: admin, Password: pass

# Connect to MongoDB directly
mongosh "mongodb://admin:password@localhost:27017/mps_db_dev?authSource=admin"

# Connect to Redis
redis-cli -h localhost -p 6379 -a redispassword
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
- `NODE_ENV=development`
- `PORT=3000`
- `MONGODB_URI=mongodb://admin:password@localhost:27017/mps_db_dev?authSource=admin`
- `REDIS_HOST=localhost`
- `JWT_ACCESS_EXPIRES_IN=24h`
- `LOG_LEVEL=debug`

**Frontend (.env.local)**:
- `VITE_API_URL=http://localhost:3000/api/v1`

### Service Ports
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Swagger Docs**: http://localhost:3000/api/v1/docs

## 🧪 Testing the Setup

### 1. Verify Backend Health
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Test Authentication
```bash
# Login with admin credentials
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nisn":"ADMIN001","password":"Admin123!"}'
```

### 3. Access Frontend
Open http://localhost:5173 in your browser and login with any demo credentials.

## 🐛 Troubleshooting

### Common Issues

**Docker not running**:
```bash
# Start Docker Desktop
open -a Docker
# Wait for Docker to start, then retry database setup
```

**Port conflicts**:
```bash
# Check what's using the ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :27017 # MongoDB
```

**Database connection issues**:
```bash
# Restart database services
docker-compose -f docker-compose.dev.yml restart mongodb redis
```

**Frontend not connecting to backend**:
- Verify backend is running on port 3000
- Check `.env.local` has correct `VITE_API_URL`
- Ensure CORS is configured properly in backend

### Logs

```bash
# View backend logs
cd apps/backend && pnpm run dev

# View database logs
docker-compose -f docker-compose.dev.yml logs mongodb
docker-compose -f docker-compose.dev.yml logs redis
```

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/api/v1/docs
- **Project Structure**: See `README.md` in root directory
- **Backend Documentation**: `apps/backend/README.md`
- **Frontend Documentation**: `apps/frontend/README.md`

## 🎯 Development Workflow

1. **Start Services**: Database → Backend → Frontend
2. **Make Changes**: Code changes auto-reload in development
3. **Test Features**: Use demo accounts to test different user roles
4. **Debug Issues**: Check logs and use browser dev tools
5. **Commit Changes**: Pre-commit hooks run linting and formatting

---

**Happy Coding! 🚀**

For questions or issues, check the project documentation or create an issue in the repository.