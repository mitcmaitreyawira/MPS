import { PerformanceService } from '../../../common/services/performance.service';

/**
 * UserPerformanceHelper handles performance tracking for user operations.
 * This follows the Single Responsibility Principle by separating performance monitoring concerns.
 */
export class UserPerformanceHelper {
  constructor(private readonly performanceService: PerformanceService) {}

  /**
   * Start a performance timer for user operations
   * @param operation - The operation name
   * @param metadata - Additional metadata
   * @returns Timer ID
   */
  startTimer(operation: string, metadata: Record<string, any> = {}): string {
    const timerId = `${operation}-${Date.now()}`;
    this.performanceService.startTimer(timerId, metadata);
    return timerId;
  }

  /**
   * End a performance timer with success
   * @param timerId - The timer ID
   * @param metadata - Additional metadata
   */
  endTimerSuccess(timerId: string, metadata: Record<string, any> = {}): void {
    this.performanceService.endTimer(timerId, { success: true, ...metadata });
  }

  /**
   * End a performance timer with error
   * @param timerId - The timer ID
   * @param reason - Error reason
   * @param metadata - Additional metadata
   */
  endTimerError(timerId: string, reason: string, metadata: Record<string, any> = {}): void {
    this.performanceService.endTimer(timerId, { error: true, reason, ...metadata });
  }

  /**
   * Track a database operation with timing
   * @param operation - Database operation name
   * @param collection - Collection name
   * @param startTime - Operation start time
   * @param metadata - Additional metadata
   */
  trackDatabaseOperation(
    operation: string,
    collection: string,
    startTime: number,
    metadata: Record<string, any> = {}
  ): void {
    const duration = Date.now() - startTime;
    this.performanceService.trackDatabaseOperation(operation, collection, duration, metadata);
  }

  /**
   * Execute a database operation with automatic performance tracking
   * @param operation - Operation name
   * @param collection - Collection name
   * @param dbOperation - The database operation to execute
   * @param metadata - Additional metadata
   * @returns The result of the database operation
   */
  async trackDbOperation<T>(
    operation: string,
    collection: string,
    dbOperation: () => Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await dbOperation();
      this.trackDatabaseOperation(operation, collection, startTime, {
        success: true,
        ...metadata,
      });
      return result;
    } catch (error) {
      this.trackDatabaseOperation(operation, collection, startTime, {
        error: true,
        ...metadata,
      });
      throw error;
    }
  }
}