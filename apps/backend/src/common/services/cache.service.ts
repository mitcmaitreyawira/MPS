import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StructuredLoggerService } from './logger.service';

/**
 * Enhanced cache service providing advanced caching operations.
 * Includes cache invalidation patterns, bulk operations, and monitoring.
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: StructuredLoggerService,
  ) {}

  /**
   * Get a value from cache with optional fallback function.
   * 
   * @param key - Cache key
   * @param fallback - Function to execute if cache miss occurs
   * @param ttl - Time to live in milliseconds
   * @returns Cached or computed value
   * 
   * @example
   * ```typescript
   * const users = await this.cacheService.getOrSet(
   *   'users:active',
   *   () => this.usersRepository.findActive(),
   *   300000 // 5 minutes
   * );
   * ```
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl: number = 300000,
  ): Promise<T> {
    try {
      const cached = await this.cacheManager.get<T>(key);
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
    } catch (error) {
      this.logger.error('Cache operation failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
      return fallback();
    }
  }

  /**
   * Set a value in cache with optional TTL.
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set for key: ${key}`);
    } catch (error) {
      this.logger.error('Cache set failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
    }
  }

  /**
   * Get a value from cache.
   * 
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await this.cacheManager.get<T>(key);
      if (result !== undefined) {
        this.logger.debug(`Cache hit for key: ${key}`);
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
      }
      return result;
    } catch (error) {
      this.logger.error('Cache get failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
      return undefined;
    }
  }

  /**
   * Delete a specific cache key.
   * 
   * @param key - Cache key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error('Cache delete failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { key } });
    }
  }

  /**
   * Clear all cache entries.
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('Cache cleared completely');
    } catch (error) {
      this.logger.error('Cache reset failed', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
    }
  }

  /**
   * Invalidate cache entries by pattern.
   * Useful for invalidating related cache entries.
   * 
   * @param pattern - Pattern to match cache keys
   * 
   * @example
   * ```typescript
   * // Invalidate all user-related cache entries
   * await this.cacheService.invalidatePattern('users:*');
   * ```
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use a more efficient cache store
      const store = this.cacheManager.store as any;
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys();
        const matchingKeys = keys.filter((key: string) => 
          this.matchPattern(key, pattern)
        );
        
        await Promise.all(
          matchingKeys.map((key: string) => this.cacheManager.del(key))
        );
        
        this.logger.log(`Invalidated ${matchingKeys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error('Cache pattern invalidation failed', undefined, { error: error instanceof Error ? error : new Error(String(error)), metadata: { pattern } });
    }
  }

  /**
   * Backward-compatible alias for invalidatePattern.
   * Some legacy code/tests may still call deletePattern.
   */
  async deletePattern(pattern: string): Promise<void> {
    return this.invalidatePattern(pattern);
  }

  /**
   * Get cache statistics (if supported by the cache store).
   * 
   * @returns Cache statistics object
   */
  async getStats(): Promise<any> {
    try {
      const store = this.cacheManager.store as any;
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys();
        return {
          totalKeys: keys.length,
          timestamp: new Date().toISOString(),
        };
      }
      return { message: 'Statistics not available for this cache store' };
    } catch (error) {
      this.logger.error('Failed to get cache stats', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
      return { error: 'Failed to retrieve cache statistics' };
    }
  }

  /**
   * Warm up cache with predefined data.
   * Useful for preloading frequently accessed data.
   * 
   * @param entries - Array of cache entries to preload
   */
  async warmUp(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      await Promise.all(
        entries.map(({ key, value, ttl }) => this.set(key, value, ttl))
      );
      this.logger.log(`Cache warmed up with ${entries.length} entries`);
    } catch (error) {
      this.logger.error('Cache warm up failed', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
    }
  }

  /**
   * Simple pattern matching for cache key invalidation.
   * 
   * @param key - Cache key to test
   * @param pattern - Pattern with wildcards (*)
   * @returns Whether the key matches the pattern
   */
  private matchPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }
}