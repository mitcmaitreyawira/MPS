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
exports.AuditLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_logs_service_1 = require("./audit-logs.service");
const create_audit_log_dto_1 = require("./dto/create-audit-log.dto");
const query_audit_logs_dto_1 = require("./dto/query-audit-logs.dto");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AuditLogsController = class AuditLogsController {
    auditLogsService;
    constructor(auditLogsService) {
        this.auditLogsService = auditLogsService;
    }
    async create(createAuditLogDto, req) {
        const user = req.user;
        return this.auditLogsService.create(createAuditLogDto, user.id, user.email || user.name || 'Unknown User');
    }
    async findAll(query) {
        return this.auditLogsService.findAll(query);
    }
};
exports.AuditLogsController = AuditLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new audit log entry' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Audit log created successfully',
        type: audit_log_entity_1.AuditLog,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_audit_log_dto_1.CreateAuditLogDto, Object]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, description: 'Filter by action type' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'Filter by user ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit logs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                logs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AuditLog' },
                },
                total: { type: 'number' },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_audit_logs_dto_1.QueryAuditLogsDto]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "findAll", null);
exports.AuditLogsController = AuditLogsController = __decorate([
    (0, swagger_1.ApiTags)('Audit Logs'),
    (0, common_1.Controller)('audit-logs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_logs_service_1.AuditLogsService])
], AuditLogsController);
//# sourceMappingURL=audit-logs.controller.js.map