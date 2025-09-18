import { CleanupService } from '../services/cleanup.service';
export declare class CleanupController {
    private readonly cleanupService;
    constructor(cleanupService: CleanupService);
    cleanupPerformanceMetrics(): Promise<{
        message: string;
    }>;
    cleanupSyncOperations(): Promise<{
        message: string;
    }>;
    cleanupFailedOperations(): Promise<{
        message: string;
    }>;
    performMaintenance(): Promise<{
        message: string;
    }>;
    performManualCleanup(metricsOlderThanDays?: number, syncOlderThanDays?: number, dryRun?: boolean): Promise<{
        message: string;
        result: {
            metricsDeleted: number;
            syncOperationsDeleted: number;
        };
    }>;
    getCleanupStatus(): Promise<{
        message: string;
        scheduledJobs: {
            name: string;
            schedule: string;
            description: string;
        }[];
    }>;
}
//# sourceMappingURL=cleanup.controller.d.ts.map