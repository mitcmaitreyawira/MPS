export interface HealthCheck {
    status: 'ok' | 'error';
    timestamp: string;
    uptime: number;
    version: string;
    services: ServiceHealth[];
}
export interface ServiceHealth {
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    lastCheck: string;
    details?: Record<string, any>;
}
export interface ApiMetrics {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: MemoryUsage;
    cpuUsage: number;
}
export interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface BulkOperation<T> {
    items: T[];
    batchSize?: number;
}
export interface BulkOperationResult<T> {
    success: T[];
    failed: BulkOperationError<T>[];
    total: number;
    successCount: number;
    failedCount: number;
}
export interface BulkOperationError<T> {
    item: T;
    error: string;
    index: number;
}
//# sourceMappingURL=api.types.d.ts.map