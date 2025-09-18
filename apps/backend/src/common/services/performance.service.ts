import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ClientSession } from 'mongoose';
import { PerformanceMetric, PerformanceMetricDocument, RequestTimer, RequestTimerDocument } from '../../database/schemas/performance-metric.schema';
import { StructuredLoggerService } from './logger.service';

/**
 * Performance monitoring service for tracking application metrics.
 * Provides request timing, database operation monitoring, and system health metrics.
 */
@Injectable()
export class PerformanceService implements OnModuleInit {
  private metrics: Map<string, any> = new Map();
  private requestTimes: Map<string, number> = new Map();
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly METRICS_RETENTION_DAYS = 30;
  private readonly TIMER_RETENTION_HOURS = 24;

  constructor(
    private logger: StructuredLoggerService,
    @InjectConnection() private connection: Connection,
    @InjectModel(PerformanceMetric.name) private performanceMetricModel: Model<PerformanceMetricDocument>,
    @InjectModel(RequestTimer.name) private requestTimerModel: Model<RequestTimerDocument>,
  ) {}

  async onModuleInit() {
    // Clean up old data on startup
    await this.cleanupOldData();
    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  /**
   * Execute database operations without transactions (for compatibility with standalone MongoDB).
   */
  private async executeWithoutTransaction<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Failed to execute ${operationName}`, String(error));
      throw error;
    }
  }

  /**
   * Start timing a request or operation.
   * 
   * @param id - Unique identifier for the operation
   * @param metadata - Additional metadata to track
   * 
   * @example
   * ```typescript
   * await this.performanceService.startTimer('user-query', { userId: '123' });
   * ```
   */
  async startTimer(id: string, metadata?: Record<string, any>): Promise<void> {
    const startTime = Date.now();
    this.requestTimes.set(id, startTime);
    this.metrics.set(`${id}-metadata`, metadata || {});
    
    await this.executeWithoutTransaction(async () => {
      await this.requestTimerModel.create({
         timerId: id,
         operation: id,
         startTime: new Date(startTime),
         status: 'active',
         metadata,
       });
    }, `timer start for ${id}`);
    
    this.logger.debug(`Timer started for: ${id}`, { metadata: { timerId: id, ...metadata } });
  }

  /**
   * End timing and log the duration.
   * 
   * @param id - Unique identifier for the operation
   * @param additionalData - Additional data to log with the timing
   * @returns Duration in milliseconds
   * 
   * @example
   * ```typescript
   * const duration = await this.performanceService.endTimer('user-query', { resultCount: 10 });
   * ```
   */
  async endTimer(id: string, additionalData?: Record<string, any>): Promise<number> {
    const endTime = Date.now();
    const startTime = this.requestTimes.get(id);
    
    if (!startTime) {
      this.logger.warn(`Timer not found for id: ${id}`);
      return 0;
    }
    
    const duration = endTime - startTime;
    const metadata = this.metrics.get(`${id}-metadata`) || {};
    
    await this.executeWithoutTransaction(async () => {
      // Update timer as completed
      await this.requestTimerModel.findOneAndUpdate(
        { timerId: id, status: 'active' },
        {
          endTime: new Date(endTime),
          duration,
          status: 'completed',
          metadata: { ...metadata, ...additionalData },
        }
      );
      
      // Create performance metric record
       await this.performanceMetricModel.create({
         metricType: 'request_time',
         operation: id,
         duration,
         timestamp: new Date(endTime),
         metadata: { ...metadata, ...additionalData },
         isError: additionalData?.error === true,
         errorMessage: additionalData?.error === true ? String(additionalData?.errorMessage || '') : undefined,
       });
    }, `timer end for ${id}`);
    
    // Log performance data
    this.logger.log(`Operation completed: ${id}`, {
      responseTime: duration,
      metadata: {
        timerId: id,
        duration,
        ...metadata,
        ...additionalData,
      },
    });
    
    // Clean up
    this.requestTimes.delete(id);
    this.metrics.delete(`${id}-metadata`);
    
    // Alert on slow operations (> 5 seconds)
    if (duration > 5000) {
      this.logger.warn(`Slow operation detected: ${id}`, {
        responseTime: duration,
        metadata: { timerId: id, threshold: 5000 },
      });
    }
    
    return duration;
  }

  /**
   * Track database operation performance.
   * 
   * @param operation - Database operation name
   * @param collection - Database collection/table name
   * @param duration - Operation duration in milliseconds
   * @param metadata - Additional operation metadata
   * 
   * @example
   * ```typescript
   * this.performanceService.trackDatabaseOperation(
   *   'find',
   *   'users',
   *   150,
   *   { query: { active: true }, resultCount: 25 }
   * );
   * ```
   */
  trackDatabaseOperation(
    operation: string,
    collection: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    this.logger.logDatabaseOperation(`${operation} on ${collection}`, {
      responseTime: duration,
      metadata: {
        operation,
        collection,
        duration,
        ...metadata,
      },
    });
    
    // Alert on slow database operations (> 1 second)
    if (duration > 1000) {
      this.logger.warn(`Slow database operation: ${operation} on ${collection}`, {
        responseTime: duration,
        metadata: {
          operation,
          collection,
          threshold: 1000,
          ...metadata,
        },
      });
    }
  }

  /**
   * Track memory usage and system metrics.
   * 
   * @returns Current memory usage statistics
   */
  getMemoryUsage(): NodeJS.MemoryUsage {
    const memoryUsage = process.memoryUsage();
    
    this.logger.debug('Memory usage check', {
      metadata: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
    });
    
    // Alert on high memory usage (> 500MB heap)
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
      this.logger.warn('High memory usage detected', {
        metadata: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          threshold: '500 MB',
        },
      });
    }
    
    return memoryUsage;
  }

  /**
   * Get current performance metrics summary.
   * 
   * @returns Performance metrics object
   */
  getMetrics(): Record<string, any> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      activeTimers: this.requestTimes.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a performance decorator for methods.
   * 
   * @param operationName - Name of the operation to track
   * @returns Method decorator
   * 
   * @example
   * ```typescript
   * @PerformanceMonitor('user-creation')
   * async createUser(userData: CreateUserDto) {
   *   // Method implementation
   * }
   * ```
   */
  static createDecorator(operationName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const performanceService = (this as any).performanceService as PerformanceService;
        
        if (performanceService) {
          const timerId = `${operationName}-${Date.now()}-${Math.random()}`;
          performanceService.startTimer(timerId, {
            method: propertyKey,
            className: target.constructor.name,
          });
          
          try {
            const result = await originalMethod.apply(this, args);
            performanceService.endTimer(timerId, { success: true });
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            performanceService.endTimer(timerId, { success: false, error: errorMessage });
            throw error;
          }
        } else {
          return originalMethod.apply(this, args);
        }
      };
      
      return descriptor;
    };
  }

  /**
   * Clean up expired timers (older than 1 hour).
   * Should be called periodically to prevent memory leaks.
   */
  async cleanupExpiredTimers(): Promise<void> {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    let cleanedCount = 0;
    
    // Clean up in-memory timers
    for (const [id, startTime] of this.requestTimes.entries()) {
      if (now - startTime > oneHour) {
        this.requestTimes.delete(id);
        this.metrics.delete(`${id}-metadata`);
        cleanedCount++;
      }
    }
    
    // Clean up database timers
    const cutoffTime = new Date(now - this.TIMER_RETENTION_HOURS * 60 * 60 * 1000);
    
    await this.executeWithoutTransaction(async () => {
      const dbCleanupResult = await this.requestTimerModel.deleteMany({
        $or: [
          { status: 'completed', endTime: { $lt: cutoffTime } },
          { status: 'active', startTime: { $lt: cutoffTime } }
        ]
      });
      cleanedCount += dbCleanupResult.deletedCount || 0;
    }, 'cleanup expired timers');
    
    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired timers`);
    }
  }

  /**
   * Clean up old performance data.
   */
  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.METRICS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    await this.executeWithoutTransaction(async () => {
      // Clean up old performance metrics
      const result = await this.performanceMetricModel.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      if (result.deletedCount && result.deletedCount > 0) {
        this.logger.log(`Cleaned up ${result.deletedCount} old performance metrics`);
      }
    }, 'cleanup old performance metrics');
  }

  /**
   * Start periodic cleanup process.
   */
  private startPeriodicCleanup(): void {
    setInterval(async () => {
      await this.cleanupExpiredTimers();
      await this.cleanupOldData();
    }, this.CLEANUP_INTERVAL);
  }
}

/**
 * Performance monitoring decorator.
 * Automatically tracks method execution time.
 * 
 * @param operationName - Name of the operation to track
 */
export function PerformanceMonitor(operationName: string) {
  return PerformanceService.createDecorator(operationName);
}