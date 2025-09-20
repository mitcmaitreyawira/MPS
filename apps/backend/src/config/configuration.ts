import { Logger } from '@nestjs/common';
import { getMongoUri, getUploadsDir } from './persistence';

// Validate MongoDB URI at startup
function validateMongoUri(): string {
  const mongoUri = getMongoUri();
  
  if (!mongoUri || mongoUri === 'mongodb://localhost:27017/mps') {
    const logger = new Logger('DatabaseConfig');
    logger.warn('Using default MongoDB URI. Set MONGODB_URI or MONGO_URI for production.');
  }

  // Prevent in-memory DB in non-test environments
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv !== 'test' && mongoUri.includes('mongodb-memory-server')) {
    throw new Error(
      'In-memory MongoDB is not allowed in non-test environments. ' +
      'Please provide a persistent MongoDB URI.'
    );
  }

  // Log database connection info (redact credentials)
  const logger = new Logger('DatabaseConfig');
  try {
    const url = new URL(mongoUri.replace('mongodb://', 'http://'));
    const dbName = url.pathname.substring(1) || 'default';
    const hostInfo = `${url.hostname}:${url.port || '27017'}`;
    logger.log(`🗄️  Database: ${dbName} @ ${hostInfo}`);
  } catch (error) {
    logger.log(`🗄️  Database URI validated (parsing failed, but URI format accepted)`);
  }

  return mongoUri;
}

export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3002', 10),
  },
  api: { prefix: process.env.API_PREFIX ?? 'api/v1' },
  database: { uri: validateMongoUri() },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  devlock: {
    enabled: (process.env.DEVLOCK ?? 'true') === 'true',
    lockTTL: parseInt(process.env.DEVLOCK_TTL ?? '30', 10),
  },
  security: { bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10) },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
    dest: getUploadsDir(),
  },
  cache: { ttl: parseInt(process.env.CACHE_TTL ?? '300', 10) },
  swagger: { enable: (process.env.ENABLE_SWAGGER ?? 'true') === 'true' },
});
