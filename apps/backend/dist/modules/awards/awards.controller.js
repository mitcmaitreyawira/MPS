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
exports.AwardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const awards_service_1 = require("./awards.service");
const index_1 = require("./dto/index");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_cookie_guard_1 = require("../auth/jwt-cookie.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AwardsController = class AwardsController {
    awardsService;
    constructor(awardsService) {
        this.awardsService = awardsService;
    }
    async create(createAwardDto, currentUser) {
        return this.awardsService.create(createAwardDto, currentUser);
    }
    async findAll(query) {
        return this.awardsService.findAll(query);
    }
    async getStats() {
        return this.awardsService.getStats();
    }
    async getTemplates() {
        return this.awardsService.getTemplates();
    }
    async getLeaderboard(limit) {
        return this.awardsService.getLeaderboard(limit);
    }
    async getStudentSummary(studentId) {
        return this.awardsService.getStudentSummary(studentId);
    }
    async getAwardsByRecipient(recipientId) {
        return this.awardsService.getStudentSummary(recipientId);
    }
    async createFromTemplate(templateId, recipientId, currentUser) {
        return this.awardsService.createFromTemplate(templateId, recipientId, currentUser);
    }
    async findOne(id) {
        return this.awardsService.findOne(id);
    }
    async update(id, updateAwardDto, currentUser) {
        return this.awardsService.update(id, updateAwardDto, currentUser);
    }
    async remove(id, currentUser) {
        return this.awardsService.remove(id, currentUser);
    }
};
exports.AwardsController = AwardsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'head_of_class', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new award' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Award created successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_1.CreateAwardDto, Object]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all awards with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Awards retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_1.QueryAwardsDto]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'head_of_class'),
    (0, swagger_1.ApiOperation)({ summary: 'Get award statistics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'head_of_class', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get award templates' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Templates retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get award leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Leaderboard retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student award summary' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Student awards retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "getStudentSummary", null);
__decorate([
    (0, common_1.Get)('recipient/:recipientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get awards by recipient ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Recipient awards retrieved successfully' }),
    __param(0, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "getAwardsByRecipient", null);
__decorate([
    (0, common_1.Post)('template/:templateId/create'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'head_of_class', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create award from template' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Award created from template successfully' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)('recipientId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "createFromTemplate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get award by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Award retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Award not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'head_of_class', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an award' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Award updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Award not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, index_1.UpdateAwardDto, Object]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'head_of_class', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an award' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Award revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Award not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AwardsController.prototype, "remove", null);
exports.AwardsController = AwardsController = __decorate([
    (0, swagger_1.ApiTags)('awards'),
    (0, common_1.Controller)('awards'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [awards_service_1.AwardsService])
], AwardsController);
//# sourceMappingURL=awards.controller.js.map