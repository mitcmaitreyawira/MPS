"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbName = exports.getUploadsDir = exports.getRedisUrl = exports.getMongoUri = void 0;
const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/mps';
exports.getMongoUri = getMongoUri;
const getRedisUrl = () => process.env.REDIS_URL || 'redis://localhost:6379';
exports.getRedisUrl = getRedisUrl;
const getUploadsDir = () => process.env.UPLOADS_DIR || './uploads';
exports.getUploadsDir = getUploadsDir;
const getDbName = () => {
    try {
        return new URL((0, exports.getMongoUri)()).pathname.replace(/^\//, '') || 'mps';
    }
    catch {
        return 'mps';
    }
};
exports.getDbName = getDbName;
//# sourceMappingURL=persistence.js.map