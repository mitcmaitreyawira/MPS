"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = exports.CacheTTL = exports.CacheKey = exports.CACHE_TTL_METADATA = exports.CACHE_KEY_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CACHE_KEY_METADATA = 'cache:key';
exports.CACHE_TTL_METADATA = 'cache:ttl';
const CacheKey = (key) => (0, common_1.SetMetadata)(exports.CACHE_KEY_METADATA, key);
exports.CacheKey = CacheKey;
const CacheTTL = (ttl) => (0, common_1.SetMetadata)(exports.CACHE_TTL_METADATA, ttl);
exports.CacheTTL = CacheTTL;
const Cache = (key, ttl = 300000) => {
    return (target, propertyKey, descriptor) => {
        if (propertyKey !== undefined && descriptor !== undefined) {
            (0, exports.CacheKey)(key)(target, propertyKey, descriptor);
            (0, exports.CacheTTL)(ttl)(target, propertyKey, descriptor);
        }
    };
};
exports.Cache = Cache;
//# sourceMappingURL=cache.decorator.js.map