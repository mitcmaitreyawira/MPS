import { CacheService } from '../../../common/services/cache.service';

/**
 * UserCacheHelper handles caching operations for user data.
 * This follows the Single Responsibility Principle by separating caching concerns.
 */
export class UserCacheHelper {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Generate cache key for a specific user
   * @param userId - The user ID
   * @returns Cache key string
   */
  private getUserCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  /**
   * Generate cache key pattern for users list
   * @returns Cache key pattern
   */
  private getUsersListPattern(): string {
    return 'users:list:*';
  }

  /**
   * Invalidate cache for a specific user
   * @param userId - The user ID
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.del(this.getUserCacheKey(userId));
  }

  /**
   * Invalidate cache for users list
   */
  async invalidateUsersListCache(): Promise<void> {
    await this.cacheService.invalidatePattern(this.getUsersListPattern());
  }

  /**
   * Invalidate both user and users list cache
   * @param userId - The user ID
   */
  async invalidateUserAndListCache(userId: string): Promise<void> {
    await Promise.all([
      this.invalidateUserCache(userId),
      this.invalidateUsersListCache(),
    ]);
  }

  /**
   * Invalidate all user-related cache
   * This is useful for operations that affect multiple users
   */
  async invalidateAllUserCache(): Promise<void> {
    await Promise.all([
      this.cacheService.invalidatePattern('user:*'),
      this.invalidateUsersListCache(),
    ]);
  }

  /**
   * Get cached user data
   * @param userId - The user ID
   * @returns Cached user data or null if not found
   */
  async getCachedUser(userId: string): Promise<any> {
    return await this.cacheService.get(this.getUserCacheKey(userId));
  }

  /**
   * Set user data in cache
   * @param userId - The user ID
   * @param userData - The user data to cache
   * @param ttl - Time to live in seconds (optional)
   */
  async setCachedUser(userId: string, userData: any, ttl?: number): Promise<void> {
    await this.cacheService.set(this.getUserCacheKey(userId), userData, ttl);
  }

  /**
   * Get user from cache
   */
  async getUserFromCache(userId: string): Promise<any> {
    return await this.getCachedUser(userId);
  }

  /**
   * Cache user data
   */
  async cacheUser(userId: string, userData: any, ttl: number = 300): Promise<void> {
    await this.setCachedUser(userId, userData, ttl);
  }

  /**
   * Get users list from cache
   */
  async getUsersListFromCache(query: any): Promise<any> {
    const cacheKey = `users:list:${JSON.stringify(query)}`;
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Cache users list
   */
  async cacheUsersList(query: any, data: any, ttl: number = 120): Promise<void> {
    const cacheKey = `users:list:${JSON.stringify(query)}`;
    await this.cacheService.set(cacheKey, data, ttl);
  }
}