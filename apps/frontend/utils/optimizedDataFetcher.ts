import { dataCache, CacheKeys, CacheInvalidation } from './dataCache';
import * as api from '../services/api';

// Request deduplication - prevent multiple identical requests
const pendingRequests = new Map<string, Promise<any>>();

// Batch request queue for similar operations
interface BatchRequest {
  key: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

const batchQueues = new Map<string, BatchRequest[]>();
const batchTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Optimized data fetcher with request deduplication and intelligent caching
 */
export class OptimizedDataFetcher {
  /**
   * Fetch data with automatic deduplication and caching
   */
  static async fetchWithDeduplication<T>(
    cacheKey: string,
    apiCall: () => Promise<T>,
    ttl?: number,
    forceRefresh = false
  ): Promise<T> {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = apiCall()
      .then((result) => {
        // Cache the result
        dataCache.set(cacheKey, result, ttl);
        return result;
      })
      .finally(() => {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      });

    // Store pending request
    pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  /**
   * Batch multiple user requests into a single API call
   */
  static async fetchUsersBatch(userIds: string[]): Promise<Record<string, any>> {
    const batchKey = 'users_batch';
    
    return new Promise((resolve, reject) => {
      // Add to batch queue
      if (!batchQueues.has(batchKey)) {
        batchQueues.set(batchKey, []);
      }
      
      batchQueues.get(batchKey)!.push({
        key: userIds.join(','),
        resolve,
        reject
      });

      // Clear existing timeout
      if (batchTimeouts.has(batchKey)) {
        clearTimeout(batchTimeouts.get(batchKey)!);
      }

      // Set new timeout to process batch
      const timeout = setTimeout(async () => {
        const queue = batchQueues.get(batchKey) || [];
        batchQueues.delete(batchKey);
        batchTimeouts.delete(batchKey);

        if (queue.length === 0) return;

        try {
          // Collect all unique user IDs
          const allUserIds = [...new Set(queue.flatMap(req => req.key.split(',')))];
          
          // Make single API call for all users
          const result = await api.getUsers({ ids: allUserIds });
          const userMap = result.users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {} as Record<string, any>);

          // Resolve all pending requests
          queue.forEach(req => {
            const requestedIds = req.key.split(',');
            const userData = requestedIds.reduce((acc, id) => {
              if (userMap[id]) acc[id] = userMap[id];
              return acc;
            }, {} as Record<string, any>);
            req.resolve(userData);
          });
        } catch (error) {
          // Reject all pending requests
          queue.forEach(req => req.reject(error));
        }
      }, 50); // 50ms batch window

      batchTimeouts.set(batchKey, timeout);
    });
  }

  /**
   * Prefetch data that's likely to be needed soon
   */
  static async prefetchDashboardData(userRole: string, academicYear?: string) {
    const prefetchPromises: Promise<any>[] = [];

    // Common data for all roles
    prefetchPromises.push(
      this.fetchWithDeduplication(
        CacheKeys.classes(),
        () => api.getClasses(),
        10 * 60 * 1000 // 10 minutes TTL
      )
    );

    prefetchPromises.push(
      this.fetchWithDeduplication(
        CacheKeys.actionPresets(),
        () => api.getActionPresets(),
        15 * 60 * 1000 // 15 minutes TTL
      )
    );

    // Role-specific prefetching
    if (userRole === 'ADMIN' || userRole === 'SUPER_SECRET_ADMIN') {
      prefetchPromises.push(
        this.fetchWithDeduplication(
          CacheKeys.adminDashboard(academicYear),
          () => api.getAdminDashboardData({ year: academicYear || 'current' }),
          5 * 60 * 1000 // 5 minutes TTL
        )
      );
    }

    if (userRole === 'TEACHER' || userRole === 'HEAD_OF_CLASS') {
      prefetchPromises.push(
        this.fetchWithDeduplication(
          `teacher_dashboard_${academicYear || 'current'}`,
          () => api.getTeacherDashboardData({ year: academicYear || 'current' }),
          5 * 60 * 1000
        )
      );
    }

    // Execute prefetch in background (don't await)
    Promise.allSettled(prefetchPromises).catch(error => {
      console.warn('Prefetch failed:', error);
    });
  }

  /**
   * Smart cache warming based on user activity patterns
   */
  static async warmCache(userRole: string, recentlyViewedData: string[]) {
    const warmingPromises: Promise<any>[] = [];

    // Warm frequently accessed data based on role
    if (userRole === 'ADMIN') {
      // Warm user management data
      warmingPromises.push(
        this.fetchWithDeduplication(
          CacheKeys.users({ active: true }),
          () => api.getUsers({ active: true, limit: 100 }),
          8 * 60 * 1000
        )
      );

      // Warm appeals and reports
      warmingPromises.push(
        this.fetchWithDeduplication(
          CacheKeys.appeals('pending'),
          () => api.getAppeals({ status: 'pending' }),
          3 * 60 * 1000
        )
      );
    }

    if (userRole === 'TEACHER') {
      // Warm quest data
      warmingPromises.push(
        this.fetchWithDeduplication(
          CacheKeys.quests({ active: true }),
          () => api.getAdminDashboardData({ year: 'current' }).then(data => data.quests),
          5 * 60 * 1000
        )
      );
    }

    // Execute warming in background
    Promise.allSettled(warmingPromises).catch(error => {
      console.warn('Cache warming failed:', error);
    });
  }

  /**
   * Intelligent cache invalidation based on data relationships
   */
  static invalidateRelatedData(dataType: string, entityId?: string) {
    switch (dataType) {
      case 'user':
        // Invalidate user-related caches
        dataCache.invalidatePattern(/^users_/);
        dataCache.invalidatePattern(/^admin_dashboard_/);
        dataCache.invalidatePattern(/^teacher_dashboard_/);
        if (entityId) {
          dataCache.delete(CacheKeys.userProfile(entityId));
        }
        break;

      case 'quest':
        // Invalidate quest-related caches
        dataCache.invalidatePattern(/^quests_/);
        dataCache.invalidatePattern(/^quest_participants_/);
        dataCache.invalidatePattern(/^admin_dashboard_/);
        dataCache.invalidatePattern(/^teacher_dashboard_/);
        dataCache.invalidatePattern(/^student_dashboard_/);
        break;

      case 'class':
        // Invalidate class-related caches
        dataCache.delete(CacheKeys.classes());
        dataCache.invalidatePattern(/^admin_dashboard_/);
        dataCache.invalidatePattern(/^teacher_dashboard_/);
        break;

      case 'points':
        // Invalidate point-related caches
        dataCache.invalidatePattern(/^admin_dashboard_/);
        dataCache.invalidatePattern(/^teacher_dashboard_/);
        dataCache.invalidatePattern(/^student_dashboard_/);
        dataCache.invalidatePattern(/^user_profile_/);
        break;

      default:
        // Fallback: invalidate all dashboard caches
        dataCache.invalidatePattern(/^.*_dashboard_/);
    }

    // Emit global cache invalidation event
    window.dispatchEvent(new CustomEvent('cache-invalidated', {
      detail: { dataType, entityId }
    }));
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats() {
    const stats = dataCache.getStats();
    return {
      ...stats,
      pendingRequests: pendingRequests.size,
      batchQueues: Array.from(batchQueues.entries()).map(([key, queue]) => ({
        key,
        queueSize: queue.length
      }))
    };
  }

  /**
   * Clear all caches and pending requests
   */
  static clearAll() {
    dataCache.clear();
    pendingRequests.clear();
    batchQueues.clear();
    batchTimeouts.forEach(timeout => clearTimeout(timeout));
    batchTimeouts.clear();
  }
}

// Export convenience methods
export const fetchWithDeduplication = OptimizedDataFetcher.fetchWithDeduplication;
export const prefetchDashboardData = OptimizedDataFetcher.prefetchDashboardData;
export const warmCache = OptimizedDataFetcher.warmCache;
export const invalidateRelatedData = OptimizedDataFetcher.invalidateRelatedData;
export const getCacheStats = OptimizedDataFetcher.getCacheStats;