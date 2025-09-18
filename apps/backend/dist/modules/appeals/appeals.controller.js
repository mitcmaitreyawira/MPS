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
exports.AppealsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appeals_service_1 = require("./appeals.service");
const dto_1 = require("./dto");
const appeal_entity_1 = require("./entities/appeal.entity");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AppealsController = class AppealsController {
    appealsService;
    constructor(appealsService) {
        this.appealsService = appealsService;
    }
    create(createAppealDto) {
        return this.appealsService.create(createAppealDto);
    }
    findAll(query) {
        return this.appealsService.findAll(query);
    }
    getStats() {
        return this.appealsService.getStats();
    }
    findOne(id) {
        return this.appealsService.findOne(id);
    }
    update(id, updateAppealDto) {
        return this.appealsService.update(id, updateAppealDto);
    }
    remove(id) {
        return this.appealsService.remove(id);
    }
};
exports.AppealsController = AppealsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appeal' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The appeal has been successfully created.',
        type: appeal_entity_1.Appeal,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAppealDto]),
    __metadata("design:returntype", Promise)
], AppealsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appeals with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all appeals.',
        type: [appeal_entity_1.Appeal],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryAppealsDto]),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get appeal statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return appeal statistics.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppealsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an appeal by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appeal ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return the appeal.',
        type: appeal_entity_1.Appeal,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appeal not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppealsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an appeal (including status changes)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appeal ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The appeal has been successfully updated.',
        type: appeal_entity_1.Appeal,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appeal not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAppealDto]),
    __metadata("design:returntype", Promise)
], AppealsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an appeal' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appeal ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'The appeal has been successfully deleted.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appeal not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppealsController.prototype, "remove", null);
exports.AppealsController = AppealsController = __decorate([
    (0, swagger_1.ApiTags)('appeals'),
    (0, common_1.Controller)('appeals'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [appeals_service_1.AppealsService])
], AppealsController);
//# sourceMappingURL=appeals.controller.js.map