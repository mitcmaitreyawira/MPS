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
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const rate_limit_guard_1 = require("../../common/guards/rate-limit.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_service_1 = require("./admin.service");
let AdminController = AdminController_1 = class AdminController {
    adminService;
    logger = new common_1.Logger(AdminController_1.name);
    constructor(adminService) {
        this.adminService = adminService;
    }
    async bulkDeleteUsers(body) {
        this.logger.warn(`Admin bulk delete users requested for ${body.userIds.length} users`);
        return this.adminService.bulkDeleteUsers(body.userIds);
    }
    async deleteBadge(badgeId) {
        this.logger.warn(`Admin delete badge requested for badge: ${badgeId}`);
        return this.adminService.deleteBadge(badgeId);
    }
    async emergencySystemReset() {
        this.logger.error('NUCLEAR OPTION: Emergency system reset requested');
        return this.adminService.emergencySystemReset();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('bulk-delete-users'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, rate_limit_guard_1.RateLimit)({ windowMs: 300000, maxRequests: 2 }),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk delete users (DANGEROUS)',
        description: 'Permanently delete multiple users. This action cannot be undone.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                userIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of user IDs to delete',
                },
            },
            required: ['userIds'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkDeleteUsers", null);
__decorate([
    (0, common_1.Delete)('badge/:badgeId'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, rate_limit_guard_1.RateLimit)({ windowMs: 60000, maxRequests: 10 }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete Badge (DANGEROUS)',
        description: 'Permanently delete a badge and revoke it from all users.',
    }),
    (0, swagger_1.ApiParam)({ name: 'badgeId', description: 'Badge ID to delete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Badge deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Badge not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('badgeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBadge", null);
__decorate([
    (0, common_1.Post)('emergency-reset'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, rate_limit_guard_1.RateLimit)({ windowMs: 3600000, maxRequests: 1 }),
    (0, swagger_1.ApiOperation)({
        summary: 'Emergency system reset (NUCLEAR OPTION)',
        description: 'Emergency system reset. This will reset most system data. USE ONLY IN EMERGENCIES.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Emergency reset completed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "emergencySystemReset", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin - Restricted Operations'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map