"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
function validateMongoUri() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required. ' +
            'Please set it to your MongoDB connection string (e.g., mongodb://user:pass@host:port/dbname)');
    }
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv !== 'test' && mongoUri.includes('mongodb-memory-server')) {
        throw new Error('In-memory MongoDB is not allowed in non-test environments. ' +
            'Please provide a persistent MongoDB URI.');
    }
    const logger = new common_1.Logger('DatabaseConfig');
    try {
        const url = new URL(mongoUri.replace('mongodb://', 'http://'));
        const dbName = url.pathname.substring(1) || 'default';
        const hostInfo = `${url.hostname}:${url.port || '27017'}`;
        logger.log(`🗄️  Database: ${dbName} @ ${hostInfo}`);
    }
    catch (error) {
        logger.log(`🗄️  Database URI validated (parsing failed, but URI format accepted)`);
    }
    return mongoUri;
}
exports.default = () => ({
    app: {
        env: process.env.NODE_ENV ?? 'development',
        port: parseInt(process.env.PORT ?? '3001', 10),
    },
    api: { prefix: process.env.API_PREFIX ?? 'api/v1' },
    database: { uri: validateMongoUri() },
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
//# sourceMappingURL=configuration.js.map