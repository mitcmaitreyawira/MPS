"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const logger_service_1 = require("./logger.service");
let CacheService = class CacheService {
    cacheManager;
    logger;
    constructor(cacheManager, logger) {
        this.cacheManager = cacheManager;
        this.logger = logger;
    }
    async getOrSet(key, fallback, ttl = 300000) {
        try {
            const cached = await this.cacheManager.get(key);
            if (cached !== undefined && cached !== null) {
                this.logger.debug(`Cache hit for key: ${key}`);
                return cached;
            }
            this.logger.debug(`Cache miss for key: ${key}`);
            const result = await fallback();
            if (result !== undefined && result !== null) {
                await this.cacheManager.set(key, result, ttl);
                this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}ms`);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Cache operation failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
            return fallback();
        }
    }
    async set(key, value, ttl) {
        try {
            await this.cacheManager.set(key, value, ttl);
            this.logger.debug(`Cache set for key: ${key}`);
        }
        catch (error) {
            this.logger.error('Cache set failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
        }
    }
    async get(key) {
        try {
            const result = await this.cacheManager.get(key);
            if (result !== undefined) {
                this.logger.debug(`Cache hit for key: ${key}`);
            }
            else {
                this.logger.debug(`Cache miss for key: ${key}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Cache get failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
            return undefined;
        }
    }
    async del(key) {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache deleted for key: ${key}`);
        }
        catch (error) {
            this.logger.error('Cache delete failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
        }
    }
    async reset() {
        try {
            await this.cacheManager.reset();
            this.logger.log('Cache cleared completely');
        }
        catch (error) {
            this.logger.error('Cache reset failed', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
        }
    }
    async invalidatePattern(pattern) {
        try {
            const store = this.cacheManager.store;
            if (store && typeof store.keys === 'function') {
                const keys = await store.keys();
                const matchingKeys = keys.filter((key) => this.matchPattern(key, pattern));
                await Promise.all(matchingKeys.map((key) => this.cacheManager.del(key)));
                this.logger.log(`Invalidated ${matchingKeys.length} cache entries matching pattern: ${pattern}`);
            }
        }
        catch (error) {
            this.logger.error('Cache pattern invalidation failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { pattern } });
        }
    }
    async deletePattern(pattern) {
        return this.invalidatePattern(pattern);
    }
    async getStats() {
        try {
            const store = this.cacheManager.store;
            if (store && typeof store.keys === 'function') {
                const keys = await store.keys();
                return {
                    totalKeys: keys.length,
                    timestamp: new Date().toISOString(),
                };
            }
            return { message: 'Statistics not available for this cache store' };
        }
        catch (error) {
            this.logger.error('Failed to get cache stats', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
            return { error: 'Failed to retrieve cache statistics' };
        }
    }
    async warmUp(entries) {
        try {
            await Promise.all(entries.map(({ key, value, ttl }) => this.set(key, value, ttl)));
            this.logger.log(`Cache warmed up with ${entries.length} entries`);
        }
        catch (error) {
            this.logger.error('Cache warm up failed', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
        }
    }
    matchPattern(key, pattern) {
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(key);
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, logger_service_1.StructuredLoggerService])
], CacheService);
//# sourceMappingURL=cache.service.js.map