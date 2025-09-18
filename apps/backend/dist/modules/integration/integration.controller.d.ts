import { IntegrationService, IntegrationResult } from './integration.service';
import { DataSyncService, SyncResult, DataIntegrityReport } from './data-sync.service';
import { IntegrationMonitorService } from './integration-monitor.service';
import { ValidationMiddleware } from './validation.middleware';
export declare class IntegrationController {
    private integrationService;
    private dataSyncService;
    private monitorService;
    private validationMiddleware;
    constructor(integrationService: IntegrationService, dataSyncService: DataSyncService, monitorService: IntegrationMonitorService, validationMiddleware: ValidationMiddleware);
    verifyIntegration(): Promise<IntegrationResult>;
    getConnectionStatus(): {
        timestamp: Date;
        pools: import("./integration.service").ConnectionPool[];
    };
    resetConnectionPool(poolId: string): Promise<{
        message: string;
    }>;
    checkIntegrity(): Promise<DataIntegrityReport>;
    autoFixIntegrity(report: DataIntegrityReport): Promise<DataIntegrityReport>;
    getSyncQueueStatus(): Promise<{
        pending: number;
        processing: number;
        operations: import("./data-sync.service").SyncOperationInterface[];
    }>;
    processSyncQueue(): Promise<{
        message: string;
    }>;
    executeSyncOperation(body: {
        entity: string;
        action: string;
        data: any;
    }): Promise<SyncResult>;
    getMonitoringDashboard(): {
        health: import("./integration-monitor.service").HealthCheckResult[];
        metrics: {
            [key: string]: import("./integration-monitor.service").MonitoringMetric[];
        };
        benchmarks: import("./integration-monitor.service").PerformanceBenchmark[];
        alerts: any[];
    };
    getBenchmarks(): import("./integration-monitor.service").PerformanceBenchmark[];
    recordBenchmark(body: {
        operation: string;
        duration: number;
    }): {
        message: string;
    };
    validateData(body: {
        entity: string;
        data: any;
    }): {
        valid: boolean;
        errors: import("./validation.middleware").ValidationError[] | undefined;
        sanitized: any;
    };
    validateBatch(body: {
        entity: string;
        items: any[];
    }): import("./validation.middleware").ValidationResult;
    transformData(body: {
        entity: string;
        data: any;
    }): {
        original: any;
        normalized: any;
        sanitized: any;
    };
}
//# sourceMappingURL=integration.controller.d.ts.map