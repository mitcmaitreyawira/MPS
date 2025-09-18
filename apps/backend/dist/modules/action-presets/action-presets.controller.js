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
exports.ActionPresetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const action_presets_service_1 = require("./action-presets.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const mongoose_1 = require("mongoose");
let ActionPresetsController = class ActionPresetsController {
    actionPresetsService;
    constructor(actionPresetsService) {
        this.actionPresetsService = actionPresetsService;
    }
    create(createActionPresetDto, user) {
        const presetWithCreator = {
            ...createActionPresetDto,
            createdBy: new mongoose_1.Types.ObjectId(user.sub)
        };
        return this.actionPresetsService.create(presetWithCreator);
    }
    findAll(query) {
        return this.actionPresetsService.findAll(query);
    }
    findOne(id) {
        return this.actionPresetsService.findOne(id);
    }
    update(id, updateActionPresetDto) {
        return this.actionPresetsService.update(id, updateActionPresetDto);
    }
    remove(id) {
        return this.actionPresetsService.remove(id);
    }
};
exports.ActionPresetsController = ActionPresetsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new action preset' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Action preset created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Action preset with this name already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateActionPresetDto, Object]),
    __metadata("design:returntype", void 0)
], ActionPresetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all action presets with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search by name or description' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['POSITIVE', 'NEGATIVE'], description: 'Filter by action type' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'isArchived', required: false, type: Boolean, description: 'Filter by archived status' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String, description: 'Sort field' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Action presets retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryActionPresetsDto]),
    __metadata("design:returntype", void 0)
], ActionPresetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific action preset by ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Action preset retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Action preset not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActionPresetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an action preset' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Action preset updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Action preset not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Action preset with this name already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateActionPresetDto]),
    __metadata("design:returntype", void 0)
], ActionPresetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an action preset' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Action preset deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Action preset not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActionPresetsController.prototype, "remove", null);
exports.ActionPresetsController = ActionPresetsController = __decorate([
    (0, swagger_1.ApiTags)('Action Presets'),
    (0, common_1.Controller)('action-presets'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [action_presets_service_1.ActionPresetsService])
], ActionPresetsController);
//# sourceMappingURL=action-presets.controller.js.map