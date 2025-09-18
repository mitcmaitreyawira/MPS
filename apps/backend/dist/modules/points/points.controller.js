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
exports.PointsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const point_logs_service_1 = require("./point-logs.service");
const dto_1 = require("./dto");
const point_log_entity_1 = require("./entities/point-log.entity");
let PointsController = class PointsController {
    pointLogsService;
    constructor(pointLogsService) {
        this.pointLogsService = pointLogsService;
    }
    create(createPointLogDto) {
        return this.pointLogsService.create(createPointLogDto);
    }
};
exports.PointsController = PointsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('teacher', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new point entry (alias for point-logs)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Point entry created successfully',
        type: point_log_entity_1.PointLog,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePointLogDto]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "create", null);
exports.PointsController = PointsController = __decorate([
    (0, swagger_1.ApiTags)('points'),
    (0, common_1.Controller)('points'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [point_logs_service_1.PointLogsService])
], PointsController);
//# sourceMappingURL=points.controller.js.map