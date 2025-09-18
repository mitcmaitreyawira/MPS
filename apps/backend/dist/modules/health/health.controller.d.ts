import { PerformanceService } from '../../common/services/performance.service';
import { CacheService } from '../../common/services/cache.service';
import { Connection } from 'mongoose';
export declare class HealthController {
    private readonly performanceService;
    private readonly cacheService;
    private readonly connection;
    constructor(performanceService: PerformanceService, cacheService: CacheService, connection: Connection);
    get(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    getMetrics(): Promise<{
        timestamp: string;
        performance: Record<string, any>;
        cache: any;
        system: {
            uptime: number;
            memory: NodeJS.MemoryUsage;
            cpu: NodeJS.CpuUsage;
            platform: NodeJS.Platform;
            nodeVersion: string;
        };
    }>;
    getSystemInfo(): {
        timestamp: string;
        application: {
            name: string;
            version: string;
            environment: string;
            uptime: number;
        };
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            nodeVersion: string;
            memory: NodeJS.MemoryUsage;
            cpu: NodeJS.CpuUsage;
        };
        database: {
            status: string;
        };
        cache: {
            enabled: boolean;
            type: string;
        };
    };
    getFullHealth(): Promise<{
        status: string;
        timestamp: string;
        durationMs: number;
        database: any;
        cache: any;
        counts: Record<string, number | {
            error: string;
        }>;
    }>;
    getIntegrityReport(): Promise<{
        status: string;
        timestamp: string;
        issues: {
            type: string;
            message: string;
            sample?: any[];
            total?: number;
        }[];
    }>;
}
//# sourceMappingURL=health.controller.d.ts.map