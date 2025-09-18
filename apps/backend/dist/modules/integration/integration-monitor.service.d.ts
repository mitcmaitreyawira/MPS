import { OnModuleDestroy } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { DataSyncService } from './data-sync.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export interface MonitoringMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    threshold?: {
        warning: number;
        critical: number;
    };
    status: 'normal' | 'warning' | 'critical';
}
export interface HealthCheckResult {
    component: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastChecked: Date;
    consecutiveFailures: number;
    details?: any;
}
export interface PerformanceBenchmark {
    operation: string;
    averageTime: number;
    minTime: number;
    maxTime: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    sampleSize: number;
    timestamp: Date;
}
export declare class IntegrationMonitorService implements OnModuleDestroy {
    private integrationService;
    private dataSyncService;
    private auditService;
    private readonly logger;
    private healthChecks;
    private metrics;
    private benchmarks;
    private alertThresholds;
    private timers;
    constructor(integrationService: IntegrationService, dataSyncService: DataSyncService, auditService: AuditLogsService);
    onModuleDestroy(): void;
    private initializeMonitoring;
    performHealthChecks(): Promise<void>;
    performIntegrityCheck(): Promise<void>;
    processSyncQueue(): Promise<void>;
    private checkIntegrationHealth;
    private checkDataSyncHealth;
    private collectSystemMetrics;
    private updateHealthCheck;
    private recordMetric;
    private evaluateAlerts;
    private createAlert;
    recordBenchmark(operation: string, duration: number): void;
    getPerformanceStats(operation: string): PerformanceBenchmark | null;
    getAllBenchmarks(): PerformanceBenchmark[];
    getMonitoringDashboard(): {
        health: HealthCheckResult[];
        metrics: {
            [key: string]: MonitoringMetric[];
        };
        benchmarks: PerformanceBenchmark[];
        alerts: any[];
    };
    private getMetricsByPattern;
    private percentile;
}
//# sourceMappingURL=integration-monitor.service.d.ts.map