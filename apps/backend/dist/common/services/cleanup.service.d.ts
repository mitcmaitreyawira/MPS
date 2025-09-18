import { Model, Connection } from 'mongoose';
import { PerformanceMetric } from '../../database/schemas/performance-metric.schema';
import { SyncOperation } from '../../database/schemas/sync-operation.schema';
export declare class CleanupService {
    private performanceMetricModel;
    private syncOperationModel;
    private connection;
    private readonly logger;
    constructor(performanceMetricModel: Model<PerformanceMetric>, syncOperationModel: Model<SyncOperation>, connection: Connection);
    private executeWithoutTransaction;
    cleanupOldPerformanceMetrics(): Promise<void>;
    cleanupCompletedSyncOperations(): Promise<void>;
    cleanupFailedSyncOperations(): Promise<void>;
    performMonthlyMaintenance(): Promise<void>;
    performManualCleanup(options?: {
        metricsOlderThanDays?: number;
        syncOlderThanDays?: number;
        dryRun?: boolean;
    }): Promise<{
        metricsDeleted: number;
        syncOperationsDeleted: number;
    }>;
}
//# sourceMappingURL=cleanup.service.d.ts.map