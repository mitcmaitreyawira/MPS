interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

// Singleton instance
const dataCache = new DataCache();

// Auto cleanup every 10 minutes
setInterval(() => {
  dataCache.cleanup();
}, 10 * 60 * 1000);

export { dataCache };

// Cache key generators for common data types
export const CacheKeys = {
  adminDashboard: (year?: string) => `admin_dashboard_${year || 'current'}`,
  users: (filters?: Record<string, any>) => `users_${JSON.stringify(filters || {})}`,
  quests: (filters?: Record<string, any>) => `quests_${JSON.stringify(filters || {})}`,
  classes: () => 'classes',
  actionPresets: () => 'action_presets',
  auditLogs: (page?: number, limit?: number) => `audit_logs_${page || 1}_${limit || 50}`,
  appeals: (status?: string) => `appeals_${status || 'all'}`,
  teacherReports: (status?: string) => `teacher_reports_${status || 'all'}`,
  userProfile: (userId: string) => `user_profile_${userId}`,
  questParticipants: (questId?: string) => `quest_participants_${questId || 'all'}`
};

// Utility function to create cached API calls
export function createCachedApiCall<T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  ttl?: number
): () => Promise<T> {
  return async () => {
    // Check cache first
    const cached = dataCache.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Make API call and cache result
    try {
      const result = await apiCall();
      dataCache.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

// Hook for React components to use cached data
import { useState, useEffect, useCallback } from 'react';

export function useCachedData<T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  dependencies: any[] = [],
  ttl?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = dataCache.get<T>(cacheKey);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Make API call
      const result = await apiCall();
      dataCache.set(cacheKey, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, ttl]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refresh = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    dataCache.delete(cacheKey);
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    refetch: fetchData
  };
}

// Utility to invalidate related cache entries when data changes
export const CacheInvalidation = {
  onUserChange: () => {
    dataCache.invalidatePattern(/^users_/);
    dataCache.invalidatePattern(/^user_profile_/);
    dataCache.invalidatePattern(/^admin_dashboard_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'users' } }));
  },
  
  onQuestChange: () => {
    dataCache.invalidatePattern(/^quests_/);
    dataCache.invalidatePattern(/^quest_participants_/);
    dataCache.invalidatePattern(/^admin_dashboard_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'quests' } }));
  },
  
  onClassChange: () => {
    dataCache.delete(CacheKeys.classes());
    dataCache.invalidatePattern(/^users_/);
    dataCache.invalidatePattern(/^admin_dashboard_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'classes' } }));
  },
  
  onAppealChange: () => {
    dataCache.invalidatePattern(/^appeals_/);
    dataCache.invalidatePattern(/^admin_dashboard_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'appeals' } }));
  },
  
  onTeacherReportChange: () => {
    dataCache.invalidatePattern(/^teacher_reports_/);
    dataCache.invalidatePattern(/^admin_dashboard_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'reports' } }));
  },
  
  onActionPresetChange: () => {
    dataCache.delete(CacheKeys.actionPresets());
    dataCache.invalidatePattern(/^admin_dashboard_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'presets' } }));
  },
  
  onAuditLogChange: () => {
    dataCache.invalidatePattern(/^audit_logs_/);
    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'audit' } }));
  },
  
  // Force invalidate all cache
  invalidateAll: () => {
    dataCache.clear();
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'all' } }));
  },
  
  // Invalidate dashboard-specific cache
  onDashboardDataChange: () => {
    dataCache.invalidatePattern(/^admin_dashboard_/);
    dataCache.invalidatePattern(/^teacher_dashboard_/);
    dataCache.invalidatePattern(/^student_dashboard_/);
    dataCache.invalidatePattern(/^parent_dashboard_/);
    window.dispatchEvent(new CustomEvent('dataInvalidated', { detail: { type: 'dashboard' } }));
  }
};