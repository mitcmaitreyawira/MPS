import { PerformanceService } from '../../../common/services/performance.service';
export declare class UserPerformanceHelper {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
    startTimer(operation: string, metadata?: Record<string, any>): string;
    endTimerSuccess(timerId: string, metadata?: Record<string, any>): void;
    endTimerError(timerId: string, reason: string, metadata?: Record<string, any>): void;
    trackDatabaseOperation(operation: string, collection: string, startTime: number, metadata?: Record<string, any>): void;
    trackDbOperation<T>(operation: string, collection: string, dbOperation: () => Promise<T>, metadata?: Record<string, any>): Promise<T>;
}
//# sourceMappingURL=user-performance.helper.d.ts.map