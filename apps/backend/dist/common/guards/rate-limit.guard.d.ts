import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../services/cache.service';
export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
export declare class RateLimitGuard implements CanActivate {
    private reflector;
    private cacheService;
    constructor(reflector: Reflector, cacheService: CacheService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private generateKey;
    private getClientIp;
    private getCurrentCount;
    private incrementCount;
    private getResetTime;
}
export declare const RateLimit: (options: RateLimitOptions) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=rate-limit.guard.d.ts.map