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
exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const cache_manager_1 = require("@nestjs/cache-manager");
const core_1 = require("@nestjs/core");
const cache_decorator_1 = require("../decorators/cache.decorator");
let CacheInterceptor = class CacheInterceptor {
    cacheManager;
    reflector;
    constructor(cacheManager, reflector) {
        this.cacheManager = cacheManager;
        this.reflector = reflector;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const controller = context.getClass();
        const cacheKey = this.reflector.getAllAndOverride(cache_decorator_1.CACHE_KEY_METADATA, [handler, controller]);
        const cacheTTL = this.reflector.getAllAndOverride(cache_decorator_1.CACHE_TTL_METADATA, [handler, controller]);
        if (!cacheKey) {
            return next.handle();
        }
        const fullCacheKey = this.generateCacheKey(cacheKey, request);
        try {
            const cachedResponse = await this.cacheManager.get(fullCacheKey);
            if (cachedResponse) {
                return (0, rxjs_1.of)(cachedResponse);
            }
            return next.handle().pipe((0, operators_1.tap)(async (response) => {
                if (response && this.shouldCache(response)) {
                    await this.cacheManager.set(fullCacheKey, response, cacheTTL || 300000);
                }
            }));
        }
        catch (error) {
            return next.handle();
        }
    }
    generateCacheKey(baseKey, request) {
        const { method, url, query, user } = request;
        const queryString = Object.keys(query || {})
            .sort()
            .map(key => `${key}=${query[key]}`)
            .join('&');
        const userContext = user?.id ? `user:${user.id}` : 'anonymous';
        return `${baseKey}:${method}:${url}:${queryString}:${userContext}`;
    }
    shouldCache(response) {
        if (!response || response.error) {
            return false;
        }
        if (Array.isArray(response) && response.length === 0) {
            return false;
        }
        if (typeof response === 'object' && Object.keys(response).length === 0) {
            return false;
        }
        return true;
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], CacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map