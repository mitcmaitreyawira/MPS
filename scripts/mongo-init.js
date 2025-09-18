// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('mps_db');

// Create application user
db.createUser({
  user: 'mps_user',
  pwd: 'mps_password',
  roles: [
    {
      role: 'readWrite',
      db: 'mps_db'
    }
  ]
});

// Create collections and indexes

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ roles: 1 });

// Sessions collection (for JWT blacklisting)
db.createCollection('sessions');
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ userId: 1 });

// Audit logs collection
db.createCollection('auditlogs');
db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ timestamp: 1 });
db.auditlogs.createIndex({ resource: 1 });

// System metrics collection
db.createCollection('systemmetrics');
db.systemmetrics.createIndex({ timestamp: 1 });
db.systemmetrics.createIndex({ metricType: 1 });
db.systemmetrics.createIndex({ timestamp: 1, metricType: 1 });

// Cache metadata collection
db.createCollection('cachemetadata');
db.cachemetadata.createIndex({ key: 1 }, { unique: true });
db.cachemetadata.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.cachemetadata.createIndex({ createdAt: 1 });

// Insert initial data

// Create admin user
db.users.insertOne({
  _id: ObjectId(),
  username: 'admin',
  email: 'admin@mps.com',
  password: '$2b$12$naWHX/7UQ7cxeWJCnv0mE.kq7rVt.pXN4AR4CKOdub5otKzjVEq1O', // bcrypt hash for 'admin123'
  firstName: 'System',
  lastName: 'Administrator',
  roles: ['admin'],
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
  profilePicture: null,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  }
});

// Create test user
db.users.insertOne({
  _id: ObjectId(),
  username: 'testuser',
  email: 'test@mps.com',
  password: '$2b$12$fS0g6SfZZdu1g5oT543Dr.GwypYiOSu47wQLR8uY7l33e/GT7f4Qi', // bcrypt hash for 'test123'
  firstName: 'Test',
  lastName: 'User',
  roles: ['user'],
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
  profilePicture: null,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      sms: false
    }
  }
});

// Insert initial system metrics
db.systemmetrics.insertOne({
  _id: ObjectId(),
  metricType: 'system_initialization',
  value: 1,
  metadata: {
    version: '1.0.0',
    environment: 'development',
    initializedBy: 'mongo-init-script'
  },
  timestamp: new Date()
});

// Create development database for testing
db = db.getSiblingDB('mps_db_dev');

// Create development user
db.createUser({
  user: 'mps_dev_user',
  pwd: 'mps_dev_password',
  roles: [
    {
      role: 'readWrite',
      db: 'mps_db_dev'
    }
  ]
});

// Create the same collections and indexes for development
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ roles: 1 });

db.createCollection('sessions');
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ userId: 1 });

db.createCollection('auditlogs');
db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ timestamp: 1 });
db.auditlogs.createIndex({ resource: 1 });

db.createCollection('systemmetrics');
db.systemmetrics.createIndex({ timestamp: 1 });
db.systemmetrics.createIndex({ metricType: 1 });
db.systemmetrics.createIndex({ timestamp: 1, metricType: 1 });

db.createCollection('cachemetadata');
db.cachemetadata.createIndex({ key: 1 }, { unique: true });
db.cachemetadata.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.cachemetadata.createIndex({ createdAt: 1 });

// Create test database
db = db.getSiblingDB('test');

// Create test user
db.createUser({
  user: 'test_user',
  pwd: 'test_password',
  roles: [
    {
      role: 'readWrite',
      db: 'test'
    }
  ]
});

// Create test-e2e database
db = db.getSiblingDB('test-e2e');

// Create test-e2e user
db.createUser({
  user: 'test_e2e_user',
  pwd: 'test_e2e_password',
  roles: [
    {
      role: 'readWrite',
      db: 'test-e2e'
    }
  ]
});

print('MongoDB initialization completed successfully!');