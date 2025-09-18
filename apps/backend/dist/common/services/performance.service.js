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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
exports.PerformanceMonitor = PerformanceMonitor;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_metric_schema_1 = require("../../database/schemas/performance-metric.schema");
const logger_service_1 = require("./logger.service");
let PerformanceService = class PerformanceService {
    logger;
    connection;
    performanceMetricModel;
    requestTimerModel;
    metrics = new Map();
    requestTimes = new Map();
    CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
    METRICS_RETENTION_DAYS = 30;
    TIMER_RETENTION_HOURS = 24;
    constructor(logger, connection, performanceMetricModel, requestTimerModel) {
        this.logger = logger;
        this.connection = connection;
        this.performanceMetricModel = performanceMetricModel;
        this.requestTimerModel = requestTimerModel;
    }
    async onModuleInit() {
        await this.cleanupOldData();
        this.startPeriodicCleanup();
    }
    async executeWithoutTransaction(operation, operationName) {
        try {
            return await operation();
        }
        catch (error) {
            this.logger.error(`Failed to execute ${operationName}`, String(error));
            throw error;
        }
    }
    async startTimer(id, metadata) {
        const startTime = Date.now();
        this.requestTimes.set(id, startTime);
        this.metrics.set(`${id}-metadata`, metadata || {});
        await this.executeWithoutTransaction(async () => {
            await this.requestTimerModel.create({
                timerId: id,
                operation: id,
                startTime: new Date(startTime),
                status: 'active',
                metadata,
            });
        }, `timer start for ${id}`);
        this.logger.debug(`Timer started for: ${id}`, { metadata: { timerId: id, ...metadata } });
    }
    async endTimer(id, additionalData) {
        const endTime = Date.now();
        const startTime = this.requestTimes.get(id);
        if (!startTime) {
            this.logger.warn(`Timer not found for id: ${id}`);
            return 0;
        }
        const duration = endTime - startTime;
        const metadata = this.metrics.get(`${id}-metadata`) || {};
        await this.executeWithoutTransaction(async () => {
            await this.requestTimerModel.findOneAndUpdate({ timerId: id, status: 'active' }, {
                endTime: new Date(endTime),
                duration,
                status: 'completed',
                metadata: { ...metadata, ...additionalData },
            });
            await this.performanceMetricModel.create({
                metricType: 'request_time',
                operation: id,
                duration,
                timestamp: new Date(endTime),
                metadata: { ...metadata, ...additionalData },
                isError: additionalData?.error === true,
                errorMessage: additionalData?.error === true ? String(additionalData?.errorMessage || '') : undefined,
            });
        }, `timer end for ${id}`);
        this.logger.log(`Operation completed: ${id}`, {
            responseTime: duration,
            metadata: {
                timerId: id,
                duration,
                ...metadata,
                ...additionalData,
            },
        });
        this.requestTimes.delete(id);
        this.metrics.delete(`${id}-metadata`);
        if (duration > 5000) {
            this.logger.warn(`Slow operation detected: ${id}`, {
                responseTime: duration,
                metadata: { timerId: id, threshold: 5000 },
            });
        }
        return duration;
    }
    trackDatabaseOperation(operation, collection, duration, metadata) {
        this.logger.logDatabaseOperation(`${operation} on ${collection}`, {
            responseTime: duration,
            metadata: {
                operation,
                collection,
                duration,
                ...metadata,
            },
        });
        if (duration > 1000) {
            this.logger.warn(`Slow database operation: ${operation} on ${collection}`, {
                responseTime: duration,
                metadata: {
                    operation,
                    collection,
                    threshold: 1000,
                    ...metadata,
                },
            });
        }
    }
    getMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        this.logger.debug('Memory usage check', {
            metadata: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
            },
        });
        if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
            this.logger.warn('High memory usage detected', {
                metadata: {
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                    threshold: '500 MB',
                },
            });
        }
        return memoryUsage;
    }
    getMetrics() {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        return {
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
            },
            activeTimers: this.requestTimes.size,
            timestamp: new Date().toISOString(),
        };
    }
    static createDecorator(operationName) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            descriptor.value = async function (...args) {
                const performanceService = this.performanceService;
                if (performanceService) {
                    const timerId = `${operationName}-${Date.now()}-${Math.random()}`;
                    performanceService.startTimer(timerId, {
                        method: propertyKey,
                        className: target.constructor.name,
                    });
                    try {
                        const result = await originalMethod.apply(this, args);
                        performanceService.endTimer(timerId, { success: true });
                        return result;
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        performanceService.endTimer(timerId, { success: false, error: errorMessage });
                        throw error;
                    }
                }
                else {
                    return originalMethod.apply(this, args);
                }
            };
            return descriptor;
        };
    }
    async cleanupExpiredTimers() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        let cleanedCount = 0;
        for (const [id, startTime] of this.requestTimes.entries()) {
            if (now - startTime > oneHour) {
                this.requestTimes.delete(id);
                this.metrics.delete(`${id}-metadata`);
                cleanedCount++;
            }
        }
        const cutoffTime = new Date(now - this.TIMER_RETENTION_HOURS * 60 * 60 * 1000);
        await this.executeWithoutTransaction(async () => {
            const dbCleanupResult = await this.requestTimerModel.deleteMany({
                $or: [
                    { status: 'completed', endTime: { $lt: cutoffTime } },
                    { status: 'active', startTime: { $lt: cutoffTime } }
                ]
            });
            cleanedCount += dbCleanupResult.deletedCount || 0;
        }, 'cleanup expired timers');
        if (cleanedCount > 0) {
            this.logger.log(`Cleaned up ${cleanedCount} expired timers`);
        }
    }
    async cleanupOldData() {
        const cutoffDate = new Date(Date.now() - this.METRICS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
        await this.executeWithoutTransaction(async () => {
            const result = await this.performanceMetricModel.deleteMany({
                timestamp: { $lt: cutoffDate }
            });
            if (result.deletedCount && result.deletedCount > 0) {
                this.logger.log(`Cleaned up ${result.deletedCount} old performance metrics`);
            }
        }, 'cleanup old performance metrics');
    }
    startPeriodicCleanup() {
        setInterval(async () => {
            await this.cleanupExpiredTimers();
            await this.cleanupOldData();
        }, this.CLEANUP_INTERVAL);
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __param(2, (0, mongoose_1.InjectModel)(performance_metric_schema_1.PerformanceMetric.name)),
    __param(3, (0, mongoose_1.InjectModel)(performance_metric_schema_1.RequestTimer.name)),
    __metadata("design:paramtypes", [logger_service_1.StructuredLoggerService,
        mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model])
], PerformanceService);
function PerformanceMonitor(operationName) {
    return PerformanceService.createDecorator(operationName);
}
//# sourceMappingURL=performance.service.js.map