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
exports.DashboardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboards_service_1 = require("./dashboards.service");
const jwt_cookie_guard_1 = require("../auth/jwt-cookie.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let DashboardsController = class DashboardsController {
    dashboardsService;
    constructor(dashboardsService) {
        this.dashboardsService = dashboardsService;
    }
    async getAdminDashboard(user, year) {
        return this.dashboardsService.getAdminDashboard(user, year);
    }
    async getTeacherDashboard(user, year) {
        return this.dashboardsService.getTeacherDashboard(user, year);
    }
    async getStudentDashboard(user, year) {
        return this.dashboardsService.getStudentDashboard(user, year);
    }
    async getParentDashboard(user, year) {
        return this.dashboardsService.getParentDashboard(user, year);
    }
};
exports.DashboardsController = DashboardsController;
__decorate([
    (0, common_1.Get)('admin'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Academic year filter' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Admin dashboard data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardsController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('teacher'),
    (0, roles_decorator_1.Roles)('teacher', 'head_of_class', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get teacher dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Academic year filter' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Teacher dashboard data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardsController.prototype, "getTeacherDashboard", null);
__decorate([
    (0, common_1.Get)('student'),
    (0, roles_decorator_1.Roles)('student', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Academic year filter' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Student dashboard data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardsController.prototype, "getStudentDashboard", null);
__decorate([
    (0, common_1.Get)('parent'),
    (0, roles_decorator_1.Roles)('parent', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get parent dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Academic year filter' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Parent dashboard data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardsController.prototype, "getParentDashboard", null);
exports.DashboardsController = DashboardsController = __decorate([
    (0, swagger_1.ApiTags)('Dashboards'),
    (0, common_1.Controller)('dashboards'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [dashboards_service_1.DashboardsService])
], DashboardsController);
//# sourceMappingURL=dashboards.controller.js.map