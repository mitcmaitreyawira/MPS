// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time
// It is idempotent - safe to run multiple times without duplicating data

// Get database name from environment or use default
const dbName = process.env.MONGO_INITDB_DATABASE || 'mps_db_unified';
print(`Initializing database: ${dbName}`);

// Switch to the application database
db = db.getSiblingDB(dbName);

// Create application user (idempotent)
try {
  const existingUser = db.getUser('mps_user');
  if (!existingUser) {
    db.createUser({
      user: 'mps_user',
      pwd: 'mps_password',
      roles: [
        {
          role: 'readWrite',
          db: dbName
        }
      ]
    });
    print('Created application user: mps_user');
  } else {
    print('Application user mps_user already exists, skipping creation');
  }
} catch (error) {
  if (error.code !== 11000) { // Ignore duplicate key errors
    print('Error creating user: ' + error.message);
  }
}

// Create collections and indexes (idempotent)

// Helper function to create collection if it doesn't exist
function createCollectionIfNotExists(collectionName) {
  const collections = db.getCollectionNames();
  if (!collections.includes(collectionName)) {
    db.createCollection(collectionName);
    print(`Created collection: ${collectionName}`);
  } else {
    print(`Collection ${collectionName} already exists, skipping creation`);
  }
}

// Helper function to create index if it doesn't exist
function createIndexIfNotExists(collection, indexSpec, options = {}) {
  try {
    collection.createIndex(indexSpec, options);
  } catch (error) {
    if (error.code !== 85) { // Index already exists
      print(`Error creating index: ${error.message}`);
    }
  }
}

// Users collection
createCollectionIfNotExists('users');
createIndexIfNotExists(db.users, { email: 1 }, { unique: true });
createIndexIfNotExists(db.users, { username: 1 }, { unique: true });
createIndexIfNotExists(db.users, { createdAt: 1 });
createIndexIfNotExists(db.users, { isActive: 1 });
createIndexIfNotExists(db.users, { roles: 1 });

// Sessions collection (for JWT blacklisting)
createCollectionIfNotExists('sessions');
createIndexIfNotExists(db.sessions, { token: 1 }, { unique: true });
createIndexIfNotExists(db.sessions, { expiresAt: 1 }, { expireAfterSeconds: 0 });
createIndexIfNotExists(db.sessions, { userId: 1 });

// Audit logs collection
createCollectionIfNotExists('auditlogs');
createIndexIfNotExists(db.auditlogs, { userId: 1 });
createIndexIfNotExists(db.auditlogs, { action: 1 });
createIndexIfNotExists(db.auditlogs, { timestamp: 1 });
createIndexIfNotExists(db.auditlogs, { resource: 1 });

// System metrics collection
createCollectionIfNotExists('systemmetrics');
createIndexIfNotExists(db.systemmetrics, { timestamp: 1 });
createIndexIfNotExists(db.systemmetrics, { metricType: 1 });
createIndexIfNotExists(db.systemmetrics, { timestamp: 1, metricType: 1 });

// Cache metadata collection
createCollectionIfNotExists('cachemetadata');
createIndexIfNotExists(db.cachemetadata, { key: 1 }, { unique: true });
createIndexIfNotExists(db.cachemetadata, { expiresAt: 1 }, { expireAfterSeconds: 0 });
createIndexIfNotExists(db.cachemetadata, { createdAt: 1 });

// Insert initial data (idempotent)

// Helper function to create user if not exists
function createUserIfNotExists(userData) {
  const existingUser = db.users.findOne({
    $or: [
      { email: userData.email },
      { username: userData.username }
    ]
  });
  
  if (!existingUser) {
    db.users.insertOne(userData);
    print(`Created user: ${userData.username} (${userData.email})`);
  } else {
    print(`User ${userData.username} already exists, skipping creation`);
  }
}

// Create admin user
createUserIfNotExists({
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
createUserIfNotExists({
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

// Insert system initialization metric (idempotent)
const existingMetric = db.systemmetrics.findOne({ metricType: 'system_initialization' });
if (!existingMetric) {
  db.systemmetrics.insertOne({
    _id: ObjectId(),
    metricType: 'system_initialization',
    value: 1,
    metadata: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      initializedBy: 'mongo-init-script',
      dbName: dbName
    },
    timestamp: new Date()
  });
  print('Created system initialization metric');
} else {
  print('System initialization metric already exists, skipping creation');
}

print(`MongoDB initialization completed successfully for database: ${dbName}!`);