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
exports.CleanupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cleanup_service_1 = require("../services/cleanup.service");
const jwt_cookie_guard_1 = require("../../modules/auth/jwt-cookie.guard");
const roles_guard_1 = require("../../modules/auth/roles.guard");
const roles_decorator_1 = require("../../modules/auth/roles.decorator");
let CleanupController = class CleanupController {
    cleanupService;
    constructor(cleanupService) {
        this.cleanupService = cleanupService;
    }
    async cleanupPerformanceMetrics() {
        await this.cleanupService.cleanupOldPerformanceMetrics();
        return { message: 'Performance metrics cleanup completed' };
    }
    async cleanupSyncOperations() {
        await this.cleanupService.cleanupCompletedSyncOperations();
        return { message: 'Sync operations cleanup completed' };
    }
    async cleanupFailedOperations() {
        await this.cleanupService.cleanupFailedSyncOperations();
        return { message: 'Failed operations cleanup completed' };
    }
    async performMaintenance() {
        await this.cleanupService.performMonthlyMaintenance();
        return { message: 'Monthly maintenance completed' };
    }
    async performManualCleanup(metricsOlderThanDays, syncOlderThanDays, dryRun) {
        const result = await this.cleanupService.performManualCleanup({
            metricsOlderThanDays: metricsOlderThanDays ? Number(metricsOlderThanDays) : undefined,
            syncOlderThanDays: syncOlderThanDays ? Number(syncOlderThanDays) : undefined,
            dryRun: dryRun === true || String(dryRun) === 'true',
        });
        return {
            message: 'Manual cleanup completed',
            result,
        };
    }
    async getCleanupStatus() {
        return {
            message: 'Cleanup service is running',
            scheduledJobs: [
                { name: 'Performance Metrics Cleanup', schedule: 'Daily at 2:00 AM', description: 'Removes metrics older than 30 days' },
                { name: 'Completed Sync Operations Cleanup', schedule: 'Daily at 2:30 AM', description: 'Removes completed operations older than 7 days' },
                { name: 'Failed Sync Operations Cleanup', schedule: 'Weekly on Sunday at 3:00 AM', description: 'Removes failed operations older than 30 days' },
                { name: 'Monthly Maintenance', schedule: 'Monthly on 1st at 4:00 AM', description: 'Comprehensive cleanup and database optimization' },
            ],
        };
    }
};
exports.CleanupController = CleanupController;
__decorate([
    (0, common_1.Post)('performance-metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually clean up old performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup completed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "cleanupPerformanceMetrics", null);
__decorate([
    (0, common_1.Post)('sync-operations'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually clean up completed sync operations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup completed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "cleanupSyncOperations", null);
__decorate([
    (0, common_1.Post)('failed-operations'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually clean up old failed sync operations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup completed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "cleanupFailedOperations", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform comprehensive monthly maintenance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance completed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "performMaintenance", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform manual cleanup with custom parameters' }),
    (0, swagger_1.ApiQuery)({ name: 'metricsOlderThanDays', required: false, type: Number, description: 'Delete metrics older than N days (default: 30)' }),
    (0, swagger_1.ApiQuery)({ name: 'syncOlderThanDays', required: false, type: Number, description: 'Delete sync operations older than N days (default: 7)' }),
    (0, swagger_1.ApiQuery)({ name: 'dryRun', required: false, type: Boolean, description: 'Perform dry run without actual deletion (default: false)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Manual cleanup completed successfully' }),
    __param(0, (0, common_1.Query)('metricsOlderThanDays')),
    __param(1, (0, common_1.Query)('syncOlderThanDays')),
    __param(2, (0, common_1.Query)('dryRun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "performManualCleanup", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cleanup service status and database statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "getCleanupStatus", null);
exports.CleanupController = CleanupController = __decorate([
    (0, swagger_1.ApiTags)('Cleanup'),
    (0, common_1.Controller)('cleanup'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [cleanup_service_1.CleanupService])
], CleanupController);
//# sourceMappingURL=cleanup.controller.js.map