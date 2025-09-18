# MPS Operations Runbook

Comprehensive operational procedures for the MPS (Management Portal System) application covering deployment, monitoring, backup/restore, and incident response.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [System Architecture](#system-architecture)
3. [Deployment Procedures](#deployment-procedures)
4. [Monitoring & Logging](#monitoring--logging)
5. [Backup & Restore](#backup--restore)
6. [Incident Response](#incident-response)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Maintenance Tasks](#maintenance-tasks)

## Quick Reference

### Essential Commands

```bash
# Health Check
./scripts/health-check.sh

# Backup Data
./scripts/backup.sh

# Restore from Backup
./scripts/restore.sh backups/backup_YYYYMMDD_HHMMSS.tar.gz

# Rollback Options
./scripts/rollback.sh last-backup     # Restore from latest backup
./scripts/rollback.sh restart-all     # Soft restart all services
./scripts/rollback.sh emergency-stop  # Emergency shutdown

# Logging & Metrics
./scripts/logging-metrics.sh status   # Show system status
./scripts/logging-metrics.sh collect  # Collect current metrics
./scripts/logging-metrics.sh tail     # Tail all service logs

# Development
npm run setup    # Install dependencies
npm run dev      # Start development servers
npm run build    # Build for production
npm run test     # Run test suites
```

### Service Ports

- **Backend API**: `http://localhost:3002`
- **Frontend**: `http://localhost:5173`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

### Key Directories

- **Logs**: `./logs/`
- **Backups**: `./backups/`
- **Metrics**: `./metrics/`
- **Scripts**: `./scripts/`
- **Docker**: `./docker/`

## System Architecture

### Components

1. **Backend (NestJS)**
   - Authentication & Authorization
   - Password Management
   - Audit Logging
   - User Management
   - Class Management

2. **Frontend (React + Vite)**
   - Admin Dashboard
   - User Interface
   - Authentication UI
   - Password Management UI

3. **Database (MongoDB)**
   - User data
   - Audit logs
   - Session data
   - Application configuration

4. **Cache (Redis)**
   - Session storage
   - Rate limiting
   - Temporary data

### Data Flow

```
User → Frontend → Backend API → MongoDB/Redis
                     ↓
                Audit Logs
```

## Deployment Procedures

### Local Development

1. **Prerequisites**
   ```bash
   # Ensure Docker is running
   docker --version
   
   # Install dependencies
   npm run setup
   ```

2. **Start Infrastructure**
   ```bash
   # Start MongoDB
   docker run -d --name mps-mongodb -p 27017:27017 mongo:6
   
   # Start Redis
   docker run -d --name mps-redis -p 6379:6379 redis:7
   ```

3. **Start Application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or individually
   cd apps/backend && npm run start:dev
   cd apps/frontend && npm run dev
   ```

4. **Database Setup Complete**
   The database is now ready for live data. No seed scripts are needed as the system is configured to handle real data inputs during testing.

### Production Deployment

1. **Using Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # Check service health
   ./scripts/health-check.sh
   ```

2. **Environment Configuration**
   - Copy `docker/.env.production` to `docker/.env`
   - Update production values:
     - `MONGODB_URI`
     - `JWT_ACCESS_SECRET`
     - `JWT_REFRESH_SECRET`
     - `CORS_ORIGIN`

3. **SSL/TLS Setup**
   - Configure reverse proxy (nginx/traefik)
   - Set up SSL certificates
   - Update CORS origins

## Monitoring & Logging

### Setup Monitoring

```bash
# Initialize logging infrastructure
./scripts/logging-metrics.sh setup

# Configure automated collection (add to crontab)
*/5 * * * * /path/to/mps/scripts/logging-metrics.sh collect
0 2 * * * /path/to/mps/scripts/logging-metrics.sh rotate
0 3 * * 0 /path/to/mps/scripts/logging-metrics.sh cleanup
```

### Key Metrics to Monitor

1. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk space
   - Network I/O

2. **Application Metrics**
   - Response times
   - Error rates
   - Active sessions
   - Database connections

3. **Business Metrics**
   - User logins
   - Password changes
   - Failed authentication attempts
   - Audit log entries

### Log Locations

- **Application logs**: `./logs/{service}/`
- **System metrics**: `./metrics/daily/`
- **Docker logs**: `docker logs mps-{service}`

### Alerting Thresholds

- **CPU usage**: > 80% for 5 minutes
- **Memory usage**: > 85% for 5 minutes
- **Disk space**: > 90% used
- **Error rate**: > 5% of requests
- **Response time**: > 2 seconds average

## Backup & Restore

### Automated Backups

```bash
# Daily backup (add to crontab)
0 2 * * * /path/to/mps/scripts/backup.sh

# Manual backup
./scripts/backup.sh
```

### Backup Contents

- MongoDB database dump
- Redis data snapshot
- Application configuration
- Environment files (excluding secrets)

### Restore Procedures

1. **Full System Restore**
   ```bash
   # Stop services
   docker-compose down
   
   # Restore from backup
   ./scripts/restore.sh backups/backup_20240101_020000.tar.gz
   
   # Restart services
   docker-compose up -d
   
   # Verify integrity
   ./scripts/health-check.sh
   ```

2. **Selective Restore**
   ```bash
   # MongoDB only
   mongorestore --uri mongodb://localhost:27017/mps_db --archive=mongo.archive --drop
   
   # Redis only
   redis-cli FLUSHALL
   # Copy dump.rdb and restart Redis
   ```

### Backup Retention

- **Daily backups**: 30 days
- **Weekly backups**: 12 weeks
- **Monthly backups**: 12 months

## Incident Response

### Severity Levels

1. **Critical (P1)**: System down, data loss
2. **High (P2)**: Major functionality impaired
3. **Medium (P3)**: Minor functionality issues
4. **Low (P4)**: Cosmetic issues, feature requests

### Response Procedures

#### P1 - Critical Incidents

1. **Immediate Actions**
   ```bash
   # Check system status
   ./scripts/health-check.sh
   
   # Check recent logs
   ./scripts/logging-metrics.sh tail
   
   # If data corruption suspected
   ./scripts/rollback.sh last-backup
   ```

2. **Communication**
   - Notify stakeholders immediately
   - Update status page
   - Document timeline

3. **Resolution**
   - Identify root cause
   - Implement fix
   - Verify resolution
   - Post-incident review

#### P2 - High Priority

1. **Assessment**
   ```bash
   # Soft restart attempt
   ./scripts/rollback.sh restart-all
   
   # Check specific service
   docker logs mps-backend
   docker logs mps-frontend
   ```

2. **Escalation**
   - If not resolved in 30 minutes, escalate to P1

## Rollback Procedures

### Rollback Options

1. **Configuration Rollback**
   ```bash
   # Revert to previous configuration
   git checkout HEAD~1 -- docker/.env.production
   docker-compose up -d
   ```

2. **Data Rollback**
   ```bash
   # Restore from latest backup
   ./scripts/rollback.sh last-backup
   ```

3. **Code Rollback**
   ```bash
   # Rollback to previous Docker images
   ./scripts/rollback.sh previous-image
   ```

4. **Emergency Procedures**
   ```bash
   # Emergency stop all services
   ./scripts/rollback.sh emergency-stop
   
   # Manual investigation and recovery
   ```

### Rollback Decision Matrix

| Issue Type | Recommended Action |
|------------|-------------------|
| Configuration error | Configuration rollback |
| Data corruption | Data rollback |
| Code deployment issue | Code rollback |
| Infrastructure failure | Emergency stop + manual recovery |
| Performance degradation | Soft restart |

## Troubleshooting Guide

### Common Issues

#### Authentication Failures

**Symptoms**: Users cannot log in, JWT errors

**Diagnosis**:
```bash
# Check backend logs
docker logs mps-backend | grep -i "auth\|jwt\|login"

# Verify JWT configuration
grep JWT apps/backend/.env
```

**Solutions**:
1. Verify JWT secrets are set
2. Check token expiration settings
3. Clear Redis sessions: `redis-cli FLUSHALL`

#### Database Connection Issues

**Symptoms**: Backend cannot connect to MongoDB

**Diagnosis**:
```bash
# Check MongoDB status
docker ps | grep mongodb
docker logs mps-mongodb

# Test connection
mongo mongodb://localhost:27017/mps_db --eval "db.stats()"
```

**Solutions**:
1. Restart MongoDB container
2. Check network connectivity
3. Verify MONGODB_URI configuration

#### Performance Issues

**Symptoms**: Slow response times, timeouts

**Diagnosis**:
```bash
# Check system resources
./scripts/logging-metrics.sh status

# Check container stats
docker stats

# Check database performance
mongo --eval "db.currentOp()"
```

**Solutions**:
1. Scale containers: `docker-compose up -d --scale backend=2`
2. Optimize database queries
3. Add caching layers
4. Increase resource limits

### Debug Commands

```bash
# Container inspection
docker inspect mps-backend
docker exec -it mps-backend /bin/bash

# Network debugging
docker network ls
docker network inspect mps_default

# Volume inspection
docker volume ls
docker volume inspect mps_mongodb_data

# Resource usage
docker system df
docker system prune
```

## Maintenance Tasks

### Daily Tasks

- [ ] Check system health
- [ ] Review error logs
- [ ] Verify backup completion
- [ ] Monitor resource usage

### Weekly Tasks

- [ ] Review security logs
- [ ] Update dependencies (dev environment)
- [ ] Performance analysis
- [ ] Capacity planning review

### Monthly Tasks

- [ ] Security updates
- [ ] Database maintenance
- [ ] Backup restore testing
- [ ] Documentation updates
- [ ] Disaster recovery testing

### Quarterly Tasks

- [ ] Full security audit
- [ ] Performance benchmarking
- [ ] Infrastructure review
- [ ] Business continuity testing

---

## Emergency Contacts

- **System Administrator**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **Security Team**: [Contact Info]
- **Development Team**: [Contact Info]

## Additional Resources

- [Application Documentation](./README.md)
- [API Documentation](./API.md)
- [Security Guidelines](./SECURITY.md)
- [Development Guide](./DEVELOPMENT.md)

---

*Last Updated: $(date '+%Y-%m-%d')*
*Version: 1.0*