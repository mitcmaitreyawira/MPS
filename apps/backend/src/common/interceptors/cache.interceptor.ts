import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

/**
 * Cache interceptor that automatically caches responses based on decorators.
 * Provides intelligent cache key generation and TTL management.
 * 
 * @example
 * ```typescript
 * @Get('users')
 * @UseInterceptors(CacheInterceptor)
 * @CacheKey('users-list')
 * @CacheTTL(300) // 5 minutes
 * async findAll() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  /**
   * Intercepts requests to check cache and store responses.
   * 
   * @param context - The execution context
   * @param next - The call handler
   * @returns Observable with cached or fresh data
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get cache configuration from decorators
    const cacheKey = this.reflector.getAllAndOverride<string>(
      CACHE_KEY_METADATA,
      [handler, controller],
    );

    const cacheTTL = this.reflector.getAllAndOverride<number>(
      CACHE_TTL_METADATA,
      [handler, controller],
    );

    // Skip caching if no cache key is defined
    if (!cacheKey) {
      return next.handle();
    }

    // Generate full cache key with query parameters and user context
    const fullCacheKey = this.generateCacheKey(cacheKey, request);

    try {
      // Try to get cached response
      const cachedResponse = await this.cacheManager.get(fullCacheKey);
      if (cachedResponse) {
        return of(cachedResponse);
      }

      // If not cached, execute handler and cache the response
      return next.handle().pipe(
        tap(async (response) => {
          if (response && this.shouldCache(response)) {
            await this.cacheManager.set(
              fullCacheKey,
              response,
              cacheTTL || 300000, // Default 5 minutes
            );
          }
        }),
      );
    } catch (error) {
      // If cache fails, continue without caching
      return next.handle();
    }
  }

  /**
   * Generates a unique cache key based on the base key and request context.
   * 
   * @param baseKey - The base cache key from decorator
   * @param request - The HTTP request object
   * @returns Generated cache key
   */
  private generateCacheKey(baseKey: string, request: any): string {
    const { method, url, query, user } = request;
    const queryString = Object.keys(query || {})
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');
    
    const userContext = user?.id ? `user:${user.id}` : 'anonymous';
    
    return `${baseKey}:${method}:${url}:${queryString}:${userContext}`;
  }

  /**
   * Determines if a response should be cached.
   * 
   * @param response - The response to evaluate
   * @returns Whether the response should be cached
   */
  private shouldCache(response: any): boolean {
    // Don't cache null, undefined, or error responses
    if (!response || response.error) {
      return false;
    }

    // Don't cache empty arrays or objects
    if (Array.isArray(response) && response.length === 0) {
      return false;
    }

    if (typeof response === 'object' && Object.keys(response).length === 0) {
      return false;
    }

    return true;
  }
}