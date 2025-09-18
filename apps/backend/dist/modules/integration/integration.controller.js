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
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_cookie_guard_1 = require("../auth/jwt-cookie.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const integration_service_1 = require("./integration.service");
const data_sync_service_1 = require("./data-sync.service");
const integration_monitor_service_1 = require("./integration-monitor.service");
const validation_middleware_1 = require("./validation.middleware");
let IntegrationController = class IntegrationController {
    integrationService;
    dataSyncService;
    monitorService;
    validationMiddleware;
    constructor(integrationService, dataSyncService, monitorService, validationMiddleware) {
        this.integrationService = integrationService;
        this.dataSyncService = dataSyncService;
        this.monitorService = monitorService;
        this.validationMiddleware = validationMiddleware;
    }
    async verifyIntegration() {
        return this.integrationService.verifySystemIntegration();
    }
    getConnectionStatus() {
        const pools = this.integrationService.getConnectionPoolStatus();
        return {
            timestamp: new Date(),
            pools: Array.from(pools.values()),
        };
    }
    async resetConnectionPool(poolId) {
        await this.integrationService.resetConnectionPool(poolId);
        return { message: `Connection pool ${poolId} reset successfully` };
    }
    async checkIntegrity() {
        return this.dataSyncService.checkDataIntegrity();
    }
    async autoFixIntegrity(report) {
        return this.dataSyncService.autoFixIntegrityIssues(report);
    }
    getSyncQueueStatus() {
        return this.dataSyncService.getSyncQueueStatus();
    }
    async processSyncQueue() {
        await this.dataSyncService.processSyncQueue();
        return { message: 'Sync queue processing initiated' };
    }
    async executeSyncOperation(body) {
        const validated = this.validationMiddleware.validateData(body.entity, body.data);
        if (!validated.valid) {
            throw new Error(`Validation failed: ${JSON.stringify(validated.errors)}`);
        }
        return this.dataSyncService.executeSyncOperation(async () => {
            return validation_middleware_1.DataTransformer.normalize(validated.sanitizedData, body.entity);
        }, body.entity, body.action);
    }
    getMonitoringDashboard() {
        return this.monitorService.getMonitoringDashboard();
    }
    getBenchmarks() {
        return this.monitorService.getAllBenchmarks();
    }
    recordBenchmark(body) {
        this.monitorService.recordBenchmark(body.operation, body.duration);
        return { message: 'Benchmark recorded' };
    }
    validateData(body) {
        const result = this.validationMiddleware.validateData(body.entity, body.data);
        return {
            valid: result.valid,
            errors: result.errors,
            sanitized: result.sanitizedData,
        };
    }
    validateBatch(body) {
        return this.validationMiddleware.validateBatch(body.entity, body.items);
    }
    transformData(body) {
        const normalized = validation_middleware_1.DataTransformer.normalize(body.data, body.entity);
        const sanitized = validation_middleware_1.DataTransformer.sanitize(normalized, body.entity);
        return {
            original: body.data,
            normalized,
            sanitized,
        };
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Get)('verify'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify system integration health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration verification result' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "verifyIntegration", null);
__decorate([
    (0, common_1.Get)('connections'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get connection pool status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connection pool status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getConnectionStatus", null);
__decorate([
    (0, common_1.Post)('connections/:poolId/reset'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset a connection pool' }),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "resetConnectionPool", null);
__decorate([
    (0, common_1.Get)('integrity'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Check data integrity across all entities' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Data integrity report' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "checkIntegrity", null);
__decorate([
    (0, common_1.Post)('integrity/auto-fix'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Automatically fix resolvable integrity issues' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "autoFixIntegrity", null);
__decorate([
    (0, common_1.Get)('sync/queue'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get synchronization queue status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getSyncQueueStatus", null);
__decorate([
    (0, common_1.Post)('sync/process'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger sync queue processing' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "processSyncQueue", null);
__decorate([
    (0, common_1.Post)('sync/execute'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a synchronized operation with transaction support' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "executeSyncOperation", null);
__decorate([
    (0, common_1.Get)('monitor/dashboard'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive monitoring dashboard data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getMonitoringDashboard", null);
__decorate([
    (0, common_1.Get)('monitor/benchmarks'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance benchmarks for all operations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getBenchmarks", null);
__decorate([
    (0, common_1.Post)('monitor/benchmark'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Record a performance benchmark' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "recordBenchmark", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate data against entity schema' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "validateData", null);
__decorate([
    (0, common_1.Post)('validate/batch'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate batch data against entity schema' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "validateBatch", null);
__decorate([
    (0, common_1.Post)('transform'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Transform and normalize data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "transformData", null);
exports.IntegrationController = IntegrationController = __decorate([
    (0, swagger_1.ApiTags)('Integration'),
    (0, common_1.Controller)('integration'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService,
        data_sync_service_1.DataSyncService,
        integration_monitor_service_1.IntegrationMonitorService,
        validation_middleware_1.ValidationMiddleware])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map