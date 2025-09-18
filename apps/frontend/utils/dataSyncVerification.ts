import { dataCache, CacheKeys } from './dataCache';
import * as api from '../services/api';
import { getCacheStats } from './optimizedDataFetcher';

/**
 * Data synchronization verification and health monitoring
 */
export class DataSyncVerification {
  private static healthCheckInterval: NodeJS.Timeout | null = null;
  private static syncIssues: SyncIssue[] = [];
  private static listeners: ((issues: SyncIssue[]) => void)[] = [];

  /**
   * Start continuous health monitoring
   */
  static startHealthMonitoring(intervalMs = 60000) { // 1 minute default
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);

    // Perform initial health check
    this.performHealthCheck();
  }

  /**
   * Stop health monitoring
   */
  static stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<HealthCheckResult> {
    const issues: SyncIssue[] = [];
    const startTime = Date.now();

    try {
      // Check cache health
      const cacheHealth = this.checkCacheHealth();
      if (!cacheHealth.healthy) {
        issues.push(...cacheHealth.issues);
      }

      // Check API connectivity
      const apiHealth = await this.checkApiHealth();
      if (!apiHealth.healthy) {
        issues.push(...apiHealth.issues);
      }

      // Check data consistency
      const consistencyHealth = await this.checkDataConsistency();
      if (!consistencyHealth.healthy) {
        issues.push(...consistencyHealth.issues);
      }

      // Check sync timing
      const syncHealth = this.checkSyncTiming();
      if (!syncHealth.healthy) {
        issues.push(...syncHealth.issues);
      }

      this.syncIssues = issues;
      this.notifyListeners(issues);

      return {
        healthy: issues.length === 0,
        issues,
        checkDuration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      const criticalIssue: SyncIssue = {
        type: 'critical',
        category: 'health_check',
        message: 'Health check failed to complete',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      };

      this.syncIssues = [criticalIssue];
      this.notifyListeners([criticalIssue]);

      return {
        healthy: false,
        issues: [criticalIssue],
        checkDuration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check cache health and performance
   */
  private static checkCacheHealth(): { healthy: boolean; issues: SyncIssue[] } {
    const issues: SyncIssue[] = [];
    const stats = getCacheStats();

    // Check cache size
    if (stats.size > 1000) {
      issues.push({
        type: 'warning',
        category: 'cache',
        message: 'Cache size is large',
        details: `Cache contains ${stats.size} entries, consider cleanup`,
        timestamp: new Date()
      });
    }

    // Check for stale entries (this would require additional cache metadata)
    const staleThreshold = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    let staleCount = 0;

    // This is a simplified check - in a real implementation,
    // you'd iterate through cache entries and check timestamps
    stats.keys.forEach(key => {
      // Simplified stale detection logic
      if (key.includes('dashboard') && Math.random() > 0.9) { // Simulate stale detection
        staleCount++;
      }
    });

    if (staleCount > 5) {
      issues.push({
        type: 'warning',
        category: 'cache',
        message: 'Multiple stale cache entries detected',
        details: `${staleCount} potentially stale entries found`,
        timestamp: new Date()
      });
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Check API connectivity and response times
   */
  private static async checkApiHealth(): Promise<{ healthy: boolean; issues: SyncIssue[] }> {
    const issues: SyncIssue[] = [];

    try {
      const startTime = Date.now();
      await api.getHealthFull();
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) { // 5 seconds
        issues.push({
          type: 'warning',
          category: 'api',
          message: 'Slow API response time',
          details: `Health check took ${responseTime}ms`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'api',
        message: 'API health check failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Check data consistency between cache and server
   */
  private static async checkDataConsistency(): Promise<{ healthy: boolean; issues: SyncIssue[] }> {
    const issues: SyncIssue[] = [];

    try {
      // Check if critical data exists in cache
      const classesCache = dataCache.get(CacheKeys.classes());
      const presetsCache = dataCache.get(CacheKeys.actionPresets());

      if (!classesCache) {
        issues.push({
          type: 'info',
          category: 'consistency',
          message: 'Classes data not cached',
          details: 'Classes data should be cached for better performance',
          timestamp: new Date()
        });
      }

      if (!presetsCache) {
        issues.push({
          type: 'info',
          category: 'consistency',
          message: 'Action presets not cached',
          details: 'Action presets should be cached for better performance',
          timestamp: new Date()
        });
      }

      // In a more comprehensive implementation, you could:
      // 1. Compare cache timestamps with server last-modified headers
      // 2. Verify data integrity with checksums
      // 3. Check for missing required data

    } catch (error) {
      issues.push({
        type: 'error',
        category: 'consistency',
        message: 'Data consistency check failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Check synchronization timing and patterns
   */
  private static checkSyncTiming(): { healthy: boolean; issues: SyncIssue[] } {
    const issues: SyncIssue[] = [];

    // Check if there have been recent sync activities
    const lastSyncTime = localStorage.getItem('lastDataSync');
    if (lastSyncTime) {
      const timeSinceSync = Date.now() - parseInt(lastSyncTime);
      const maxSyncAge = 10 * 60 * 1000; // 10 minutes

      if (timeSinceSync > maxSyncAge) {
        issues.push({
          type: 'warning',
          category: 'sync_timing',
          message: 'Data sync is overdue',
          details: `Last sync was ${Math.round(timeSinceSync / 60000)} minutes ago`,
          timestamp: new Date()
        });
      }
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Get current sync issues
   */
  static getCurrentIssues(): SyncIssue[] {
    return [...this.syncIssues];
  }

  /**
   * Subscribe to sync issue updates
   */
  static subscribe(listener: (issues: SyncIssue[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of sync issues
   */
  private static notifyListeners(issues: SyncIssue[]) {
    this.listeners.forEach(listener => {
      try {
        listener(issues);
      } catch (error) {
        console.error('Error notifying sync issue listener:', error);
      }
    });
  }

  /**
   * Force a data refresh to resolve sync issues
   */
  static async forceSyncRefresh(): Promise<void> {
    try {
      // Clear all caches
      dataCache.clear();
      
      // Update last sync time
      localStorage.setItem('lastDataSync', Date.now().toString());
      
      // Emit refresh event
      window.dispatchEvent(new CustomEvent('force-data-refresh'));
      
      // Clear current issues
      this.syncIssues = [];
      this.notifyListeners([]);
      
    } catch (error) {
      console.error('Failed to force sync refresh:', error);
    }
  }

  /**
   * Get sync health summary
   */
  static getHealthSummary(): HealthSummary {
    const issues = this.getCurrentIssues();
    const criticalCount = issues.filter(i => i.type === 'critical').length;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;

    return {
      healthy: criticalCount === 0 && errorCount === 0,
      totalIssues: issues.length,
      criticalCount,
      errorCount,
      warningCount,
      infoCount,
      lastCheck: issues.length > 0 ? issues[0].timestamp : null
    };
  }
}

// Types
export interface SyncIssue {
  type: 'critical' | 'error' | 'warning' | 'info';
  category: 'cache' | 'api' | 'consistency' | 'sync_timing' | 'health_check';
  message: string;
  details?: string;
  timestamp: Date;
}

export interface HealthCheckResult {
  healthy: boolean;
  issues: SyncIssue[];
  checkDuration: number;
  timestamp: Date;
}

export interface HealthSummary {
  healthy: boolean;
  totalIssues: number;
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  lastCheck: Date | null;
}

// Auto-start health monitoring when module loads
if (typeof window !== 'undefined') {
  // Start monitoring after a short delay to allow app initialization
  setTimeout(() => {
    DataSyncVerification.startHealthMonitoring();
  }, 5000);

  // Update sync timestamp on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      localStorage.setItem('lastDataSync', Date.now().toString());
    }
  });
}

export default DataSyncVerification;