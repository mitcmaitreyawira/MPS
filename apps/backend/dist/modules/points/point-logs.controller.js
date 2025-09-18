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
exports.PointLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const point_logs_service_1 = require("./point-logs.service");
const dto_1 = require("./dto");
const point_log_entity_1 = require("./entities/point-log.entity");
let PointLogsController = class PointLogsController {
    pointLogsService;
    constructor(pointLogsService) {
        this.pointLogsService = pointLogsService;
    }
    create(createPointLogDto) {
        return this.pointLogsService.create(createPointLogDto);
    }
    bulkCreate(bulkCreatePointLogsDto) {
        return this.pointLogsService.bulkCreate(bulkCreatePointLogsDto);
    }
    findAll(queryPointLogsDto) {
        return this.pointLogsService.findAll(queryPointLogsDto);
    }
    getStats() {
        return this.pointLogsService.getStats();
    }
    getStudentSummary(studentId) {
        return this.pointLogsService.getStudentSummary(studentId);
    }
    findOne(id) {
        return this.pointLogsService.findOne(id);
    }
    update(id, updatePointLogDto) {
        return this.pointLogsService.update(id, updatePointLogDto);
    }
    remove(id) {
        return this.pointLogsService.remove(id);
    }
};
exports.PointLogsController = PointLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('teacher', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new point log entry' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Point log entry created successfully',
        type: point_log_entity_1.PointLog,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePointLogDto]),
    __metadata("design:returntype", Promise)
], PointLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)('teacher', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple point log entries' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Point log entries created successfully',
        type: [point_log_entity_1.PointLog],
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BulkCreatePointLogsDto]),
    __metadata("design:returntype", Promise)
], PointLogsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all point log entries with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Point log entries retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PointLog' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryPointLogsDto]),
    __metadata("design:returntype", void 0)
], PointLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('teacher', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get point log statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Point log statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                totalEntries: { type: 'number' },
                totalPointsAwarded: { type: 'number' },
                totalPointsDeducted: { type: 'number' },
                netPoints: { type: 'number' },
                entriesByType: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                },
                entriesByCategory: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                },
                badgesAwarded: { type: 'number' },
                averagePointsPerEntry: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PointLogsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('student/:studentId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get point summary for a specific student' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student point summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                studentId: { type: 'string' },
                totalPoints: { type: 'number' },
                pointsAwarded: { type: 'number' },
                pointsDeducted: { type: 'number' },
                totalEntries: { type: 'number' },
                entriesByType: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                },
                entriesByCategory: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                },
                badges: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Badge' },
                },
                recentEntries: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PointLog' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PointLogsController.prototype, "getStudentSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a point log entry by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Point log entry retrieved successfully',
        type: point_log_entity_1.PointLog,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Point log entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('teacher', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a point log entry' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Point log entry updated successfully',
        type: point_log_entity_1.PointLog,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Point log entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePointLogDto]),
    __metadata("design:returntype", Promise)
], PointLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a point log entry' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Point log entry deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Point log entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointLogsController.prototype, "remove", null);
exports.PointLogsController = PointLogsController = __decorate([
    (0, swagger_1.ApiTags)('point-logs'),
    (0, common_1.Controller)('point-logs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [point_logs_service_1.PointLogsService])
], PointLogsController);
//# sourceMappingURL=point-logs.controller.js.map