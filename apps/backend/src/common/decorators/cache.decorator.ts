import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Decorator to set cache key for a method or controller.
 * Used in conjunction with CacheInterceptor to enable automatic caching.
 * 
 * @param key - The cache key to use
 * 
 * @example
 * ```typescript
 * @Get('users')
 * @CacheKey('users-list')
 * async findAll() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * Decorator to set cache TTL (Time To Live) in milliseconds.
 * Used in conjunction with CacheInterceptor to control cache expiration.
 * 
 * @param ttl - Time to live in milliseconds
 * 
 * @example
 * ```typescript
 * @Get('users')
 * @CacheKey('users-list')
 * @CacheTTL(300000) // 5 minutes
 * async findAll() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * Decorator to enable caching with both key and TTL.
 * Convenience decorator that combines CacheKey and CacheTTL.
 * 
 * @param key - The cache key to use
 * @param ttl - Time to live in milliseconds (default: 300000 = 5 minutes)
 * 
 * @example
 * ```typescript
 * @Get('users')
 * @Cache('users-list', 600000) // 10 minutes
 * async findAll() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export const Cache = (key: string, ttl: number = 300000) => {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined && descriptor !== undefined) {
      CacheKey(key)(target, propertyKey, descriptor);
      CacheTTL(ttl)(target, propertyKey, descriptor);
    }
  };
};