"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IntegrationMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationMonitorService = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
const data_sync_service_1 = require("./data-sync.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let IntegrationMonitorService = IntegrationMonitorService_1 = class IntegrationMonitorService {
    integrationService;
    dataSyncService;
    auditService;
    logger = new common_1.Logger(IntegrationMonitorService_1.name);
    healthChecks = new Map();
    metrics = new Map();
    benchmarks = new Map();
    alertThresholds = {
        responseTime: { warning: 1000, critical: 5000 },
        errorRate: { warning: 0.05, critical: 0.1 },
        availability: { warning: 0.99, critical: 0.95 },
    };
    timers = [];
    constructor(integrationService, dataSyncService, auditService) {
        this.integrationService = integrationService;
        this.dataSyncService = dataSyncService;
        this.auditService = auditService;
        this.initializeMonitoring();
        this.timers.push(setInterval(() => this.performHealthChecks().catch(() => undefined), 60_000));
        this.timers.push(setInterval(() => this.performIntegrityCheck().catch(() => undefined), 60 * 60_000));
        this.timers.push(setInterval(() => this.processSyncQueue().catch(() => undefined), 5 * 60_000));
    }
    onModuleDestroy() {
        for (const t of this.timers)
            clearInterval(t);
        this.timers = [];
    }
    initializeMonitoring() {
        const components = ['database', 'cache', 'api', 'sync'];
        components.forEach(component => {
            this.healthChecks.set(component, {
                component,
                status: 'healthy',
                responseTime: 0,
                lastChecked: new Date(),
                consecutiveFailures: 0,
            });
        });
    }
    async performHealthChecks() {
        this.logger.debug('Performing scheduled health checks');
        await this.checkIntegrationHealth();
        await this.checkDataSyncHealth();
        await this.collectSystemMetrics();
        await this.evaluateAlerts();
    }
    async performIntegrityCheck() {
        this.logger.log('Performing scheduled integrity check');
        const report = await this.dataSyncService.checkDataIntegrity();
        if (report.issues.length > 0) {
            this.logger.warn(`Found ${report.issues.length} integrity issues`);
            const fixed = await this.dataSyncService.autoFixIntegrityIssues(report);
            if (fixed.fixedCount > 0) {
                this.logger.log(`Auto-fixed ${fixed.fixedCount} issues`);
            }
            if (fixed.pendingCount > 0) {
                await this.createAlert('integrity', `${fixed.pendingCount} unresolved integrity issues`, 'warning');
            }
        }
    }
    async processSyncQueue() {
        this.logger.debug('Processing sync queue');
        await this.dataSyncService.processSyncQueue();
    }
    async checkIntegrationHealth() {
        const start = Date.now();
        try {
            const result = await this.integrationService.verifySystemIntegration();
            const responseTime = Date.now() - start;
            this.updateHealthCheck('database', {
                status: result.details.database?.status === 'connected' ? 'healthy' : 'unhealthy',
                responseTime,
                details: result.details.database,
            });
            this.updateHealthCheck('cache', {
                status: result.details.cache?.status === 'operational' ? 'healthy' : 'unhealthy',
                responseTime,
                details: result.details.cache,
            });
            this.recordMetric('integration.verification.time', responseTime, 'ms');
            this.recordMetric('integration.success.rate', result.success ? 1 : 0, 'ratio');
        }
        catch (error) {
            this.logger.error('Integration health check failed', error);
            this.updateHealthCheck('database', { status: 'unhealthy', responseTime: Date.now() - start });
        }
    }
    async checkDataSyncHealth() {
        const queueStatus = await this.dataSyncService.getSyncQueueStatus();
        this.updateHealthCheck('sync', {
            status: queueStatus.pending > 100 ? 'degraded' : 'healthy',
            responseTime: 0,
            details: queueStatus,
        });
        this.recordMetric('sync.queue.pending', queueStatus.pending, 'count');
        this.recordMetric('sync.queue.processing', queueStatus.processing, 'count');
    }
    async collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        this.recordMetric('system.memory.heap.used', memUsage.heapUsed / 1024 / 1024, 'MB');
        this.recordMetric('system.memory.heap.total', memUsage.heapTotal / 1024 / 1024, 'MB');
        this.recordMetric('system.memory.rss', memUsage.rss / 1024 / 1024, 'MB');
        const cpuUsage = process.cpuUsage();
        this.recordMetric('system.cpu.user', cpuUsage.user / 1000, 'ms');
        this.recordMetric('system.cpu.system', cpuUsage.system / 1000, 'ms');
    }
    updateHealthCheck(component, update) {
        const current = this.healthChecks.get(component);
        if (!current)
            return;
        const updated = {
            ...current,
            ...update,
            lastChecked: new Date(),
        };
        if (update.status === 'unhealthy') {
            updated.consecutiveFailures = current.consecutiveFailures + 1;
        }
        else {
            updated.consecutiveFailures = 0;
        }
        this.healthChecks.set(component, updated);
    }
    recordMetric(name, value, unit) {
        const metric = {
            name,
            value,
            unit,
            timestamp: new Date(),
            status: 'normal',
        };
        if (name.includes('responseTime') && value > this.alertThresholds.responseTime.critical) {
            metric.status = 'critical';
        }
        else if (name.includes('responseTime') && value > this.alertThresholds.responseTime.warning) {
            metric.status = 'warning';
        }
        const metricHistory = this.metrics.get(name) ?? [];
        metricHistory.push(metric);
        if (metricHistory.length > 100) {
            metricHistory.shift();
        }
        this.metrics.set(name, metricHistory);
    }
    async evaluateAlerts() {
        for (const [component, health] of this.healthChecks.entries()) {
            if (health.status === 'unhealthy' && health.consecutiveFailures >= 3) {
                await this.createAlert(component, `${component} has been unhealthy for ${health.consecutiveFailures} consecutive checks`, 'critical');
            }
        }
        const responseMetrics = this.getMetricsByPattern('responseTime');
        for (const [name, metrics] of responseMetrics) {
            const recent = metrics.slice(-5);
            const avgResponseTime = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
            if (avgResponseTime > this.alertThresholds.responseTime.critical) {
                await this.createAlert(name, `High response time: ${avgResponseTime.toFixed(0)}ms`, 'critical');
            }
        }
    }
    async createAlert(source, message, severity) {
        this.logger[severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'log'](`Alert [${severity}] from ${source}: ${message}`);
        await this.auditService.create({
            action: 'monitoring_alert',
            details: {
                source,
                message,
                severity,
                timestamp: new Date(),
            },
        }, 'system', 'System Monitoring');
    }
    recordBenchmark(operation, duration) {
        const samples = this.benchmarks.get(operation) ?? [];
        samples.push(duration);
        if (samples.length > 1000) {
            samples.shift();
        }
        this.benchmarks.set(operation, samples);
    }
    getPerformanceStats(operation) {
        const samples = this.benchmarks.get(operation);
        if (!samples || samples.length === 0) {
            return null;
        }
        const sorted = [...samples].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, val) => acc + val, 0);
        return {
            operation,
            averageTime: sum / sorted.length,
            minTime: sorted[0],
            maxTime: sorted[sorted.length - 1],
            p50: this.percentile(sorted, 50),
            p90: this.percentile(sorted, 90),
            p95: this.percentile(sorted, 95),
            p99: this.percentile(sorted, 99),
            sampleSize: sorted.length,
            timestamp: new Date(),
        };
    }
    getAllBenchmarks() {
        const benchmarks = [];
        for (const [operation] of this.benchmarks.entries()) {
            const stats = this.getPerformanceStats(operation);
            if (stats) {
                benchmarks.push(stats);
            }
        }
        return benchmarks;
    }
    getMonitoringDashboard() {
        return {
            health: Array.from(this.healthChecks.values()),
            metrics: Object.fromEntries(this.metrics),
            benchmarks: this.getAllBenchmarks(),
            alerts: [],
        };
    }
    getMetricsByPattern(pattern) {
        const matching = new Map();
        for (const [name, metrics] of this.metrics.entries()) {
            if (name.includes(pattern)) {
                matching.set(name, metrics);
            }
        }
        return matching;
    }
    percentile(sorted, p) {
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
};
exports.IntegrationMonitorService = IntegrationMonitorService;
exports.IntegrationMonitorService = IntegrationMonitorService = IntegrationMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService,
        data_sync_service_1.DataSyncService,
        audit_logs_service_1.AuditLogsService])
], IntegrationMonitorService);
//# sourceMappingURL=integration-monitor.service.js.map