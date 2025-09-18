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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const rate_limit_guard_1 = require("../../common/guards/rate-limit.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const error_response_service_1 = require("../../common/services/error-response.service");
let UsersController = class UsersController {
    usersService;
    errorResponseService;
    constructor(usersService, errorResponseService) {
        this.usersService = usersService;
        this.errorResponseService = errorResponseService;
    }
    async findAll(query) {
        return this.usersService.findAll(query);
    }
    async findOne(id) {
        return this.usersService.findOne(id);
    }
    async create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async createBulk(createUsersDto) {
        return this.usersService.createBulk(createUsersDto.users);
    }
    async update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    async remove(id) {
        return this.usersService.remove(id);
    }
    async archive(id) {
        return this.usersService.archive(id);
    }
    async restore(id) {
        return this.usersService.restore(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid query parameters' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryUsersDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid user ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, rate_limit_guard_1.RateLimit)({ windowMs: 60000, maxRequests: 10 }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user', description: 'Create a new user account. Requires admin privileges.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'NISN already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, rate_limit_guard_1.RateLimit)({ windowMs: 300000, maxRequests: 5 }),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple users', description: 'Bulk create multiple user accounts. Requires admin privileges.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Users created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data or user ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'NISN already exists for another user' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid user ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive user by ID (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User archived successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore archived user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "restore", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        error_response_service_1.ErrorResponseService])
], UsersController);
//# sourceMappingURL=users.controller.js.map