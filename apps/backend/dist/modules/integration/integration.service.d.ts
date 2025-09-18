import { Connection, Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
import { Class } from '../../database/schemas/class.schema';
import { CacheService } from '../../common/services/cache.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { QuestsService } from '../quests/quests.service';
import { AppealsService } from '../appeals/appeals.service';
import { PointLogsService } from '../points/point-logs.service';
export interface IntegrationResult {
    success: boolean;
    timestamp: Date;
    duration: number;
    details: any;
    errors?: string[];
}
export interface ConnectionPool {
    id: string;
    type: 'database' | 'cache' | 'external';
    status: 'active' | 'idle' | 'error';
    lastUsed: Date;
    retryCount: number;
    maxRetries: number;
}
export declare class IntegrationService {
    private connection;
    private userModel;
    private classModel;
    private questsService;
    private appealsService;
    private pointLogsService;
    private cacheService;
    private auditService;
    private readonly logger;
    private connectionPools;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(connection: Connection, userModel: Model<User>, classModel: Model<Class>, questsService: QuestsService, appealsService: AppealsService, pointLogsService: PointLogsService, cacheService: CacheService, auditService: AuditLogsService);
    private initializeConnectionPools;
    executeWithRetry<T>(operation: () => Promise<T>, poolId: string, context: string): Promise<T>;
    verifySystemIntegration(): Promise<IntegrationResult>;
    private verifyDatabaseConnection;
    private verifyCacheConnection;
    private verifyCollections;
    private verifyConnectivity;
    getConnectionPoolStatus(): Map<string, ConnectionPool>;
    resetConnectionPool(poolId: string): Promise<void>;
    private delay;
}
//# sourceMappingURL=integration.service.d.ts.map