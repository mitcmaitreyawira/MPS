import { OnModuleInit } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { PerformanceMetricDocument, RequestTimerDocument } from '../../database/schemas/performance-metric.schema';
import { StructuredLoggerService } from './logger.service';
export declare class PerformanceService implements OnModuleInit {
    private logger;
    private connection;
    private performanceMetricModel;
    private requestTimerModel;
    private metrics;
    private requestTimes;
    private readonly CLEANUP_INTERVAL;
    private readonly METRICS_RETENTION_DAYS;
    private readonly TIMER_RETENTION_HOURS;
    constructor(logger: StructuredLoggerService, connection: Connection, performanceMetricModel: Model<PerformanceMetricDocument>, requestTimerModel: Model<RequestTimerDocument>);
    onModuleInit(): Promise<void>;
    private executeWithoutTransaction;
    startTimer(id: string, metadata?: Record<string, any>): Promise<void>;
    endTimer(id: string, additionalData?: Record<string, any>): Promise<number>;
    trackDatabaseOperation(operation: string, collection: string, duration: number, metadata?: Record<string, any>): void;
    getMemoryUsage(): NodeJS.MemoryUsage;
    getMetrics(): Record<string, any>;
    static createDecorator(operationName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    cleanupExpiredTimers(): Promise<void>;
    private cleanupOldData;
    private startPeriodicCleanup;
}
export declare function PerformanceMonitor(operationName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=performance.service.d.ts.map