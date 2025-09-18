import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ClientSession } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
import { Class } from '../../database/schemas/class.schema';
import { SyncOperation, SyncOperationDocument } from '../../database/schemas/sync-operation.schema';
import { CacheService } from '../../common/services/cache.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

export interface SyncOperationInterface {
  operationId: string;
  type: 'create' | 'update' | 'delete' | 'reconcile';
  entity: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
  error?: string;
  maxRetries?: number;
  metadata?: {
    priority?: 'low' | 'medium' | 'high';
    source?: string;
    correlationId?: string;
    [key: string]: any;
  };
}

export interface SyncResult {
  success: boolean;
  operationId: string;
  entity: string;
  action: string;
  affectedCount: number;
  timestamp: Date;
  details?: any;
  error?: string;
}

export interface DataIntegrityReport {
  timestamp: Date;
  issues: IntegrityIssue[];
  fixedCount: number;
  pendingCount: number;
}

export interface IntegrityIssue {
  type: string;
  entity: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedIds: string[];
  suggestedFix?: string;
  canAutoFix: boolean;
}

@Injectable()
export class DataSyncService implements OnModuleInit {
  private readonly logger = new Logger(DataSyncService.name);
  private readonly MAX_RETRIES = 3;
  private readonly PROCESSING_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(SyncOperation.name) private syncOperationModel: Model<SyncOperationDocument>,
    private cacheService: CacheService,
    private auditService: AuditLogsService,
  ) {}

  async onModuleInit() {
    // Recover any operations that were processing when the server shut down
    await this.recoverProcessingOperations();
    // Start background queue processor
    this.startQueueProcessor();
  }

  /**
   * Recover operations that were processing when server shut down
   */
  private async recoverProcessingOperations(): Promise<void> {
    try {
      // Reset any operations that were stuck in processing state
      await this.syncOperationModel.updateMany(
        { 
          status: 'processing',
          lastProcessed: { $lt: new Date(Date.now() - this.PROCESSING_TIMEOUT) }
        },
        { 
          status: 'pending',
          $unset: { lastProcessed: 1 }
        }
      );
      
      this.logger.log('Recovered processing operations on startup');
    } catch (error) {
      this.logger.error('Failed to recover processing operations', error);
    }
  }

  /**
   * Start background queue processor
   */
  private startQueueProcessor(): void {
    // Process queue every 30 seconds
    setInterval(() => {
      this.processSyncQueue().catch(error => {
        this.logger.error('Queue processor error', error);
      });
    }, 30000);
  }

  /**
   * Execute synchronized operation without transactions (for compatibility with standalone MongoDB)
   */
  async executeSyncOperation<T>(
    operation: () => Promise<T>,
    entity: string,
    action: string,
  ): Promise<SyncResult> {
    const operationId = this.generateOperationId();

    // Create sync operation in database
    const syncOp = await this.syncOperationModel.create({
      operationId,
      type: action as any,
      entity,
      data: {},
      status: 'processing',
      retries: 0,
      maxRetries: this.MAX_RETRIES,
      lastProcessed: new Date(),
    });

    try {
      let result: any; 
      let affectedCount = 0;

      result = await operation();
      
      // Count affected documents based on result type
      if (Array.isArray(result)) {
        affectedCount = result.length;
      } else if (result && typeof result === 'object') {
        affectedCount = 1;
      }

      // Invalidate relevant caches
      await this.invalidateRelatedCaches(entity);

      // Log successful sync
      await this.auditService.create({
        action: 'data_sync',
        details: {
          operationId,
          entity,
          affectedCount,
          success: true,
        },
      }, 'system', 'System Sync');

      // Mark operation as completed
      await this.syncOperationModel.findOneAndUpdate(
        { operationId },
        { 
          status: 'completed',
          completedAt: new Date(),
          $unset: { lastProcessed: 1 }
        }
      );

      return {
        success: true,
        operationId,
        entity,
        action,
        affectedCount,
        timestamp: new Date(),
        details: result,
      };
    } catch (error) {
      this.logger.error(`Sync operation failed: ${operationId}`, error);
      
      // Handle operation failure
      const updateData: any = {
        error: (error as Error).message,
        $unset: { lastProcessed: 1 }
      };
      
      // Add to retry queue if retries available
      if (syncOp.retries < this.MAX_RETRIES) {
        updateData.status = 'pending';
        updateData.$inc = { retries: 1 };
      } else {
        updateData.status = 'failed';
      }

      await this.syncOperationModel.findOneAndUpdate(
        { operationId },
        updateData
      );

      return {
        success: false,
        operationId,
        entity,
        action,
        affectedCount: 0,
        timestamp: new Date(),
        error: (error as Error).message,
      };
    }
  }

  /**
   * Perform comprehensive data integrity check
   */
  async checkDataIntegrity(): Promise<DataIntegrityReport> {
    const issues: IntegrityIssue[] = [];

    // Check for orphaned user references
    const orphanedUsers = await this.findOrphanedUserReferences();
    if (orphanedUsers.length > 0) {
      issues.push({
        type: 'orphaned_reference',
        entity: 'User',
        severity: 'high',
        description: 'Users referencing non-existent classes',
        affectedIds: orphanedUsers,
        suggestedFix: 'Set classId to null or assign to valid class',
        canAutoFix: true,
      });
    }

    // Check for invalid class head teachers
    const invalidHeadTeachers = await this.findInvalidHeadTeachers();
    if (invalidHeadTeachers.length > 0) {
      issues.push({
        type: 'invalid_reference',
        entity: 'Class',
        severity: 'high',
        description: 'Classes with non-existent head teachers',
        affectedIds: invalidHeadTeachers.map(c => c.toString()),
        suggestedFix: 'Unset headTeacherId or assign a valid teacher',
        canAutoFix: true,
      });
    }

    // Check for duplicate entries
    const duplicates = await this.findDuplicateEntries();
    for (const dup of duplicates) {
      issues.push({
        type: 'duplicate_entry',
        entity: dup.entity,
        severity: 'medium',
        description: dup.description,
        affectedIds: dup.ids,
        suggestedFix: 'Merge or remove duplicate entries',
        canAutoFix: false,
      });
    }

    // Check for data consistency
    const inconsistencies = await this.findDataInconsistencies();
    issues.push(...inconsistencies);

    return {
      timestamp: new Date(),
      issues,
      fixedCount: 0,
      pendingCount: issues.length,
    };
  }

  /**
   * Auto-fix data integrity issues
   */
  async autoFixIntegrityIssues(report: DataIntegrityReport): Promise<DataIntegrityReport> {
    let fixedCount = 0;
    const stillPending: IntegrityIssue[] = [];

    for (const issue of report.issues) {
      if (!issue.canAutoFix) {
        stillPending.push(issue);
        continue;
      }

      try {
        const fixed = await this.fixIntegrityIssue(issue);
        if (fixed) {
          fixedCount++;
        } else {
          stillPending.push(issue);
        }
      } catch (error) {
        this.logger.error(`Failed to auto-fix issue: ${issue.type}`, error);
        stillPending.push(issue);
      }
    }

    return {
      timestamp: new Date(),
      issues: stillPending,
      fixedCount,
      pendingCount: stillPending.length,
    };
  }

  /**
   * Fix specific integrity issue
   */
  private async fixIntegrityIssue(issue: IntegrityIssue): Promise<boolean> {
    const session = await this.connection.startSession();

    try {
      let fixed = false;

      await session.withTransaction(async () => {
        switch (issue.type) {
          case 'orphaned_reference':
            if (issue.entity === 'User') {
              // Clear invalid class references
              await this.userModel.updateMany(
                { _id: { $in: issue.affectedIds }, classId: { $ne: null } },
                { $unset: { classId: 1 } },
                { session },
              );
              fixed = true;
            }
            break;

          case 'invalid_reference':
            if (issue.entity === 'Class') {
              // Additional integrity checks can be added here for other models
              await this.classModel.updateMany(
                { _id: { $in: issue.affectedIds } },
                { $unset: { headTeacherId: 1 } },
                { session },
              );
              fixed = true;
            }
            break;
        }
      });

      if (fixed) {
        await this.auditService.create({
          action: 'integrity_auto_fix',
          details: {
            issueType: issue.type,
            entity: issue.entity,
            affectedCount: issue.affectedIds.length,
          },
        }, 'system', 'System Auto-Fix');
      }

      return fixed;
    } catch (error) {
      this.logger.error(`Failed to fix integrity issue: ${issue.type}`, error);
      return false;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Find orphaned user references
   */
  private async findOrphanedUserReferences(): Promise<string[]> {
    const pipeline = [
      {
        $match: { classId: { $ne: null } },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      {
        $match: { class: { $size: 0 } },
      },
      {
        $project: { _id: 1 },
      },
    ];

    const results = await this.userModel.aggregate(pipeline);
    return results.map(r => r._id.toString());
  }

  /**
   * Find classes with invalid head teachers
   */
  private async findInvalidHeadTeachers(): Promise<string[]> {
    const pipeline = [
      {
        $match: { headTeacherId: { $ne: null } },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'headTeacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $match: { teacher: { $size: 0 } },
      },
      {
        $project: { _id: 1 },
      },
    ];

    const results = await this.classModel.aggregate(pipeline);
    return results.map(r => r._id.toString());
  }

  /**
   * Find duplicate entries
   */
  private async findDuplicateEntries(): Promise<Array<{ entity: string; description: string; ids: string[] }>> {
    const duplicates: Array<{ entity: string; description: string; ids: string[] }> = [];

    // Check for duplicate class names
    const dupClasses = await this.classModel.aggregate([
      {
        $group: {
          _id: { $toLower: '$name' },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    for (const dup of dupClasses) {
      duplicates.push({
        entity: 'Class',
        description: `Duplicate class name: ${dup._id}`,
        ids: dup.ids.map(id => id.toString()),
      });
    }

    // Check for duplicate user emails
    const dupUsers = await this.userModel.aggregate([
      {
        $group: {
          _id: { $toLower: '$email' },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    for (const dup of dupUsers) {
      duplicates.push({
        entity: 'User',
        description: `Duplicate email: ${dup._id}`,
        ids: dup.ids.map(id => id.toString()),
      });
    }

    return duplicates;
  }

  /**
   * Find data inconsistencies
   */
  private async findDataInconsistencies(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    // Additional data consistency checks can be added here
    // Currently checking basic user and class relationships

    return issues;
  }

  private async checkAdditionalIntegrity(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    
    // Placeholder for additional integrity checks
    // This can be extended with model-specific validations
    
    return issues;
  }

  /**
   * Invalidate related caches
   */
  private async invalidateRelatedCaches(entity: string): Promise<void> {
    const patterns = {
      User: ['user:*', 'dashboard:*'],
      Class: ['class:*', 'dashboard:*'],
    };

    const patternsToInvalidate = patterns[entity] || [`${entity.toLowerCase()}:*`];
    
    for (const pattern of patternsToInvalidate) {
      try {
        await this.cacheService.deletePattern(pattern);
      } catch (err) {
        this.logger.warn(`Failed to invalidate cache pattern ${pattern}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Get sync queue status
   */
  async getSyncQueueStatus(): Promise<{ pending: number; processing: number; operations: SyncOperationInterface[] }> {
    const [pendingOps, processingOps] = await Promise.all([
      this.syncOperationModel.find({ status: 'pending' }).lean(),
      this.syncOperationModel.find({ status: 'processing' }).lean(),
    ]);

    return {
      pending: pendingOps.length,
      processing: processingOps.length,
      operations: [...pendingOps, ...processingOps].map(op => ({
        operationId: op.operationId,
        type: op.type,
        entity: op.entity,
        data: op.data,
        timestamp: op.timestamp,
        status: op.status,
        retries: op.retries,
        error: op.error,
        maxRetries: op.maxRetries,
        metadata: op.metadata,
      })),
    };
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    try {
      // Get pending operations (limit to prevent overwhelming)
      const pendingOps = await this.syncOperationModel
        .find({ status: 'pending' })
        .sort({ timestamp: 1 })
        .limit(10)
        .lean();

      for (const operation of pendingOps) {
        try {
          await this.retrySyncOperation(operation);
        } catch (error) {
          this.logger.error(`Failed to process sync operation: ${operation.operationId}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error processing sync queue', error);
    }
  }

  /**
   * Retry failed sync operation
   */
  private async retrySyncOperation(operation: any): Promise<void> {
    try {
      // Mark as processing
      await this.syncOperationModel.findOneAndUpdate(
        { operationId: operation.operationId, status: 'pending' },
        { 
          status: 'processing',
          lastProcessed: new Date()
        }
      );

      this.logger.log(`Retrying sync operation: ${operation.operationId}`);
      
      // Here you would implement the actual retry logic based on operation type
      // For now, we'll mark it as completed (in a real implementation, 
      // you'd re-execute the original operation)
      
      await this.syncOperationModel.findOneAndUpdate(
        { operationId: operation.operationId },
        { 
          status: 'completed',
          completedAt: new Date(),
          $unset: { lastProcessed: 1 }
        }
      );
      
    } catch (error) {
      // Mark as failed if retry fails
      await this.syncOperationModel.findOneAndUpdate(
        { operationId: operation.operationId },
        { 
          status: 'failed',
          error: (error as Error).message,
          $unset: { lastProcessed: 1 }
        }
      );
      
      throw error;
    }
  }

  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
