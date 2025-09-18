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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimit = exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cache_service_1 = require("../services/cache.service");
let RateLimitGuard = class RateLimitGuard {
    reflector;
    cacheService;
    constructor(reflector, cacheService) {
        this.reflector = reflector;
        this.cacheService = cacheService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const rateLimitOptions = this.reflector.get('rateLimit', context.getHandler());
        if (!rateLimitOptions) {
            return true;
        }
        const key = this.generateKey(request, rateLimitOptions);
        const current = await this.getCurrentCount(key);
        const isAllowed = current < rateLimitOptions.maxRequests;
        if (isAllowed) {
            await this.incrementCount(key, rateLimitOptions.windowMs);
        }
        if (!isAllowed) {
            const resetTime = await this.getResetTime(key);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: rateLimitOptions.message || 'Too many requests',
                error: 'Too Many Requests',
                retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-RateLimit-Limit', rateLimitOptions.maxRequests);
        response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitOptions.maxRequests - current - 1));
        response.setHeader('X-RateLimit-Reset', Math.ceil((await this.getResetTime(key)) / 1000));
        return true;
    }
    generateKey(request, options) {
        const ip = this.getClientIp(request);
        const route = request.route?.path || request.path;
        const method = request.method;
        const userId = request.user?.id || 'anonymous';
        return `rate_limit:${method}:${route}:${ip}:${userId}`;
    }
    getClientIp(request) {
        return (request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            'unknown');
    }
    async getCurrentCount(key) {
        const count = await this.cacheService.get(key);
        return count ? parseInt(count, 10) : 0;
    }
    async incrementCount(key, windowMs) {
        const current = await this.getCurrentCount(key);
        await this.cacheService.set(key, (current + 1).toString(), windowMs);
    }
    async getResetTime(key) {
        return Date.now() + 60000;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        cache_service_1.CacheService])
], RateLimitGuard);
const RateLimit = (options) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('rateLimit', options, descriptor.value);
    };
};
exports.RateLimit = RateLimit;
//# sourceMappingURL=rate-limit.guard.js.map