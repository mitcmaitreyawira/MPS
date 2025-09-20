export const getMongoUri = () =>
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/mps';

export const getRedisUrl = () =>
  process.env.REDIS_URL || 'redis://localhost:6379';

export const getUploadsDir = () =>
  process.env.UPLOADS_DIR || './uploads';

export const getDbName = () => {
  try {
    return new URL(getMongoUri()).pathname.replace(/^\//,'') || 'mps';
  } catch {
    return 'mps';
  }
};