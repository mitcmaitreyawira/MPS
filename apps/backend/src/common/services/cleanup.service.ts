import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';

import { PerformanceMetric } from '../../database/schemas/performance-metric.schema';
import { SyncOperation } from '../../database/schemas/sync-operation.schema';

/**
 * CleanupService handles scheduled cleanup of old data to maintain database performance
 * and prevent storage bloat. It runs periodic jobs to remove expired metrics and
 * completed sync operations.
 */
@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectModel(PerformanceMetric.name) private performanceMetricModel: Model<PerformanceMetric>,
    @InjectModel(SyncOperation.name) private syncOperationModel: Model<SyncOperation>,
    @InjectConnection() private connection: Connection,
  ) {}

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
      this.logger.error(`Failed to execute ${operationName}:`, error);
      throw error;
    }
  }

  /**
   * Clean up old performance metrics (older than 30 days)
   * Runs daily at 2:00 AM
   */
  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldPerformanceMetrics(): Promise<void> {
    this.logger.log('Starting cleanup of old performance metrics...');

    try {
      const result = await this.executeWithoutTransaction(async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deleteResult = await this.performanceMetricModel.deleteMany(
          { timestamp: { $lt: thirtyDaysAgo } }
        );

        return deleteResult;
      }, 'cleanupOldPerformanceMetrics');

      this.logger.log(`Cleaned up ${result.deletedCount} old performance metrics`);
    } catch (error) {
      this.logger.error('Failed to cleanup old performance metrics:', error);
    }
  }

  /**
   * Clean up completed sync operations (older than 7 days)
   * Runs daily at 2:30 AM
   */
  // @Cron('30 2 * * *')
  async cleanupCompletedSyncOperations(): Promise<void> {
    this.logger.log('Starting cleanup of completed sync operations...');

    try {
      const result = await this.executeWithoutTransaction(async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const deleteResult = await this.syncOperationModel.deleteMany(
          {
            status: 'completed',
            completedAt: { $lt: sevenDaysAgo }
          }
        );

        return deleteResult;
      }, 'cleanupCompletedSyncOperations');

      this.logger.log(`Cleaned up ${result.deletedCount} completed sync operations`);
    } catch (error) {
      this.logger.error('Failed to cleanup completed sync operations:', error);
    }
  }

  /**
   * Clean up failed sync operations (older than 30 days)
   * Runs weekly on Sunday at 3:00 AM
   */
  // @Cron(CronExpression.EVERY_SUNDAY_AT_3AM)
  async cleanupFailedSyncOperations(): Promise<void> {
    this.logger.log('Starting cleanup of old failed sync operations...');

    try {
      const result = await this.executeWithoutTransaction(async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deleteResult = await this.syncOperationModel.deleteMany(
          {
            status: 'failed',
            timestamp: { $lt: thirtyDaysAgo }
          }
        );

        return deleteResult;
      }, 'cleanupFailedSyncOperations');

      this.logger.log(`Cleaned up ${result.deletedCount} old failed sync operations`);
    } catch (error) {
      this.logger.error('Failed to cleanup old failed sync operations:', error);
    }
  }

  /**
   * Comprehensive cleanup - runs monthly on the 1st at 4:00 AM
   * Performs database optimization and index maintenance
   */
  // @Cron('0 4 1 * *')
  async performMonthlyMaintenance(): Promise<void> {
    this.logger.log('Starting monthly database maintenance...');

    try {
      // Clean up very old performance metrics (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const oldMetricsResult = await this.executeWithoutTransaction(async () => {
        return await this.performanceMetricModel.deleteMany(
          { timestamp: { $lt: ninetyDaysAgo } }
        );
      }, 'monthlyMetricsCleanup');

      // Clean up very old sync operations (older than 90 days)
      const oldSyncResult = await this.executeWithoutTransaction(async () => {
        return await this.syncOperationModel.deleteMany(
          { timestamp: { $lt: ninetyDaysAgo } }
        );
      }, 'monthlySyncCleanup');

      this.logger.log(`Monthly maintenance completed:`);
      this.logger.log(`- Removed ${oldMetricsResult.deletedCount} very old performance metrics`);
      this.logger.log(`- Removed ${oldSyncResult.deletedCount} very old sync operations`);

      // Log database statistics
      const metricsCount = await this.performanceMetricModel.countDocuments();
      const syncCount = await this.syncOperationModel.countDocuments();
      
      this.logger.log(`Current database state:`);
      this.logger.log(`- Performance metrics: ${metricsCount} documents`);
      this.logger.log(`- Sync operations: ${syncCount} documents`);

    } catch (error) {
      this.logger.error('Failed to perform monthly maintenance:', error);
    }
  }

  /**
   * Manual cleanup method for administrative use
   */
  async performManualCleanup(options: {
    metricsOlderThanDays?: number;
    syncOlderThanDays?: number;
    dryRun?: boolean;
  } = {}): Promise<{
    metricsDeleted: number;
    syncOperationsDeleted: number;
  }> {
    const {
      metricsOlderThanDays = 30,
      syncOlderThanDays = 7,
      dryRun = false
    } = options;

    this.logger.log(`Manual cleanup ${dryRun ? '(DRY RUN)' : ''} - Metrics: ${metricsOlderThanDays} days, Sync: ${syncOlderThanDays} days`);

    const metricsDate = new Date();
    metricsDate.setDate(metricsDate.getDate() - metricsOlderThanDays);

    const syncDate = new Date();
    syncDate.setDate(syncDate.getDate() - syncOlderThanDays);

    if (dryRun) {
      const metricsCount = await this.performanceMetricModel.countDocuments(
        { timestamp: { $lt: metricsDate } }
      );
      const syncCount = await this.syncOperationModel.countDocuments(
        { 
          $or: [
            { status: 'completed', completedAt: { $lt: syncDate } },
            { status: 'failed', timestamp: { $lt: syncDate } }
          ]
        }
      );

      this.logger.log(`DRY RUN - Would delete ${metricsCount} metrics and ${syncCount} sync operations`);
      return { metricsDeleted: metricsCount, syncOperationsDeleted: syncCount };
    }

    const metricsResult = await this.executeWithoutTransaction(async () => {
      return await this.performanceMetricModel.deleteMany(
        { timestamp: { $lt: metricsDate } }
      );
    }, 'manualMetricsCleanup');

    const syncResult = await this.executeWithoutTransaction(async () => {
      return await this.syncOperationModel.deleteMany(
        {
          $or: [
            { status: 'completed', completedAt: { $lt: syncDate } },
            { status: 'failed', timestamp: { $lt: syncDate } }
          ]
        }
      );
    }, 'manualSyncCleanup');

    this.logger.log(`Manual cleanup completed - Deleted ${metricsResult.deletedCount} metrics and ${syncResult.deletedCount} sync operations`);
    
    return {
      metricsDeleted: metricsResult.deletedCount,
      syncOperationsDeleted: syncResult.deletedCount
    };
  }
}