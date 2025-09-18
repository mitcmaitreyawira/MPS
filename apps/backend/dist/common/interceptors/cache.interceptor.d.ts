import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
export declare class CacheInterceptor implements NestInterceptor {
    private cacheManager;
    private reflector;
    constructor(cacheManager: Cache, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private generateCacheKey;
    private shouldCache;
}
//# sourceMappingURL=cache.interceptor.d.ts.map