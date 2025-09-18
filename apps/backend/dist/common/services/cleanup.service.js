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
var CleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_metric_schema_1 = require("../../database/schemas/performance-metric.schema");
const sync_operation_schema_1 = require("../../database/schemas/sync-operation.schema");
let CleanupService = CleanupService_1 = class CleanupService {
    performanceMetricModel;
    syncOperationModel;
    connection;
    logger = new common_1.Logger(CleanupService_1.name);
    constructor(performanceMetricModel, syncOperationModel, connection) {
        this.performanceMetricModel = performanceMetricModel;
        this.syncOperationModel = syncOperationModel;
        this.connection = connection;
    }
    async executeWithoutTransaction(operation, operationName) {
        try {
            return await operation();
        }
        catch (error) {
            this.logger.error(`Failed to execute ${operationName}:`, error);
            throw error;
        }
    }
    async cleanupOldPerformanceMetrics() {
        this.logger.log('Starting cleanup of old performance metrics...');
        try {
            const result = await this.executeWithoutTransaction(async () => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const deleteResult = await this.performanceMetricModel.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
                return deleteResult;
            }, 'cleanupOldPerformanceMetrics');
            this.logger.log(`Cleaned up ${result.deletedCount} old performance metrics`);
        }
        catch (error) {
            this.logger.error('Failed to cleanup old performance metrics:', error);
        }
    }
    async cleanupCompletedSyncOperations() {
        this.logger.log('Starting cleanup of completed sync operations...');
        try {
            const result = await this.executeWithoutTransaction(async () => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const deleteResult = await this.syncOperationModel.deleteMany({
                    status: 'completed',
                    completedAt: { $lt: sevenDaysAgo }
                });
                return deleteResult;
            }, 'cleanupCompletedSyncOperations');
            this.logger.log(`Cleaned up ${result.deletedCount} completed sync operations`);
        }
        catch (error) {
            this.logger.error('Failed to cleanup completed sync operations:', error);
        }
    }
    async cleanupFailedSyncOperations() {
        this.logger.log('Starting cleanup of old failed sync operations...');
        try {
            const result = await this.executeWithoutTransaction(async () => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const deleteResult = await this.syncOperationModel.deleteMany({
                    status: 'failed',
                    timestamp: { $lt: thirtyDaysAgo }
                });
                return deleteResult;
            }, 'cleanupFailedSyncOperations');
            this.logger.log(`Cleaned up ${result.deletedCount} old failed sync operations`);
        }
        catch (error) {
            this.logger.error('Failed to cleanup old failed sync operations:', error);
        }
    }
    async performMonthlyMaintenance() {
        this.logger.log('Starting monthly database maintenance...');
        try {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const oldMetricsResult = await this.executeWithoutTransaction(async () => {
                return await this.performanceMetricModel.deleteMany({ timestamp: { $lt: ninetyDaysAgo } });
            }, 'monthlyMetricsCleanup');
            const oldSyncResult = await this.executeWithoutTransaction(async () => {
                return await this.syncOperationModel.deleteMany({ timestamp: { $lt: ninetyDaysAgo } });
            }, 'monthlySyncCleanup');
            this.logger.log(`Monthly maintenance completed:`);
            this.logger.log(`- Removed ${oldMetricsResult.deletedCount} very old performance metrics`);
            this.logger.log(`- Removed ${oldSyncResult.deletedCount} very old sync operations`);
            const metricsCount = await this.performanceMetricModel.countDocuments();
            const syncCount = await this.syncOperationModel.countDocuments();
            this.logger.log(`Current database state:`);
            this.logger.log(`- Performance metrics: ${metricsCount} documents`);
            this.logger.log(`- Sync operations: ${syncCount} documents`);
        }
        catch (error) {
            this.logger.error('Failed to perform monthly maintenance:', error);
        }
    }
    async performManualCleanup(options = {}) {
        const { metricsOlderThanDays = 30, syncOlderThanDays = 7, dryRun = false } = options;
        this.logger.log(`Manual cleanup ${dryRun ? '(DRY RUN)' : ''} - Metrics: ${metricsOlderThanDays} days, Sync: ${syncOlderThanDays} days`);
        const metricsDate = new Date();
        metricsDate.setDate(metricsDate.getDate() - metricsOlderThanDays);
        const syncDate = new Date();
        syncDate.setDate(syncDate.getDate() - syncOlderThanDays);
        if (dryRun) {
            const metricsCount = await this.performanceMetricModel.countDocuments({ timestamp: { $lt: metricsDate } });
            const syncCount = await this.syncOperationModel.countDocuments({
                $or: [
                    { status: 'completed', completedAt: { $lt: syncDate } },
                    { status: 'failed', timestamp: { $lt: syncDate } }
                ]
            });
            this.logger.log(`DRY RUN - Would delete ${metricsCount} metrics and ${syncCount} sync operations`);
            return { metricsDeleted: metricsCount, syncOperationsDeleted: syncCount };
        }
        const metricsResult = await this.executeWithoutTransaction(async () => {
            return await this.performanceMetricModel.deleteMany({ timestamp: { $lt: metricsDate } });
        }, 'manualMetricsCleanup');
        const syncResult = await this.executeWithoutTransaction(async () => {
            return await this.syncOperationModel.deleteMany({
                $or: [
                    { status: 'completed', completedAt: { $lt: syncDate } },
                    { status: 'failed', timestamp: { $lt: syncDate } }
                ]
            });
        }, 'manualSyncCleanup');
        this.logger.log(`Manual cleanup completed - Deleted ${metricsResult.deletedCount} metrics and ${syncResult.deletedCount} sync operations`);
        return {
            metricsDeleted: metricsResult.deletedCount,
            syncOperationsDeleted: syncResult.deletedCount
        };
    }
};
exports.CleanupService = CleanupService;
exports.CleanupService = CleanupService = CleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_metric_schema_1.PerformanceMetric.name)),
    __param(1, (0, mongoose_1.InjectModel)(sync_operation_schema_1.SyncOperation.name)),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection])
], CleanupService);
//# sourceMappingURL=cleanup.service.js.map