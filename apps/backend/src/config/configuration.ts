export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
  },
  api: { prefix: process.env.API_PREFIX ?? 'api/v1' },
  database: { uri: process.env.MONGODB_URI ?? 'mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin' },
  security: { bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10) },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
    dest: process.env.UPLOAD_DEST ?? './uploads',
  },
  cache: { ttl: parseInt(process.env.CACHE_TTL ?? '300', 10) },
  swagger: { enable: (process.env.ENABLE_SWAGGER ?? 'true') === 'true' },
});
