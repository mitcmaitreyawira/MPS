import { OnModuleInit } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
import { Class } from '../../database/schemas/class.schema';
import { SyncOperationDocument } from '../../database/schemas/sync-operation.schema';
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
export declare class DataSyncService implements OnModuleInit {
    private connection;
    private userModel;
    private classModel;
    private syncOperationModel;
    private cacheService;
    private auditService;
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly PROCESSING_TIMEOUT;
    constructor(connection: Connection, userModel: Model<User>, classModel: Model<Class>, syncOperationModel: Model<SyncOperationDocument>, cacheService: CacheService, auditService: AuditLogsService);
    onModuleInit(): Promise<void>;
    private recoverProcessingOperations;
    private startQueueProcessor;
    executeSyncOperation<T>(operation: () => Promise<T>, entity: string, action: string): Promise<SyncResult>;
    checkDataIntegrity(): Promise<DataIntegrityReport>;
    autoFixIntegrityIssues(report: DataIntegrityReport): Promise<DataIntegrityReport>;
    private fixIntegrityIssue;
    private findOrphanedUserReferences;
    private findInvalidHeadTeachers;
    private findDuplicateEntries;
    private findDataInconsistencies;
    private checkAdditionalIntegrity;
    private invalidateRelatedCaches;
    getSyncQueueStatus(): Promise<{
        pending: number;
        processing: number;
        operations: SyncOperationInterface[];
    }>;
    processSyncQueue(): Promise<void>;
    private retrySyncOperation;
    private generateOperationId;
}
//# sourceMappingURL=data-sync.service.d.ts.map