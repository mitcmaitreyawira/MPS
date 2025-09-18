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
exports.DataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const users_service_1 = require("../users/users.service");
const point_logs_service_1 = require("../points/point-logs.service");
const action_presets_service_1 = require("../action-presets/action-presets.service");
const point_log_entity_1 = require("../points/entities/point-log.entity");
const jwt_cookie_guard_1 = require("../auth/jwt-cookie.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
class PointsActionDto {
    type;
    points;
    category;
    description;
    academicYear;
}
__decorate([
    (0, class_validator_1.IsIn)(['points']),
    __metadata("design:type", String)
], PointsActionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PointsActionDto.prototype, "points", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PointsActionDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PointsActionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PointsActionDto.prototype, "academicYear", void 0);
class BadgeActionDto {
    type;
    presetId;
    academicYear;
}
__decorate([
    (0, class_validator_1.IsIn)(['badge']),
    __metadata("design:type", String)
], BadgeActionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BadgeActionDto.prototype, "presetId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BadgeActionDto.prototype, "academicYear", void 0);
class BulkActionBodyDto {
    classId;
    action;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkActionBodyDto.prototype, "classId", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BulkActionBodyDto.prototype, "action", void 0);
let DataController = class DataController {
    usersService;
    pointLogsService;
    actionPresetsService;
    constructor(usersService, pointLogsService, actionPresetsService) {
        this.usersService = usersService;
        this.pointLogsService = pointLogsService;
        this.actionPresetsService = actionPresetsService;
    }
    getAcademicYears() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentAcademicYear = currentMonth >= 6
            ? `${currentYear}/${currentYear + 1}`
            : `${currentYear - 1}/${currentYear}`;
        const years = [];
        for (let i = 0; i < 4; i++) {
            const year = currentYear - i;
            const academicYear = currentMonth >= 6
                ? `${year}/${year + 1}`
                : `${year - 1}/${year}`;
            years.push(academicYear);
        }
        return years.sort((a, b) => b.localeCompare(a));
    }
    async bulkAction(body, user) {
        const { classId, action } = body;
        const users = await this.usersService.findByClassId(classId);
        if (!users.length) {
            return { created: 0, message: 'No active users found in class' };
        }
        const academicYear = action.academicYear || this.getAcademicYears()[0];
        const pointLogs = [];
        const addedByUserId = user?.id || 'system';
        if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
            throw new common_1.BadRequestException('action.type is required and must be a string');
        }
        if (action.type === 'points') {
            const act = action;
            if (typeof act.points !== 'number')
                throw new common_1.BadRequestException('action.points must be a number');
            if (!act.category || typeof act.category !== 'string')
                throw new common_1.BadRequestException('action.category is required');
            if (!act.description || typeof act.description !== 'string')
                throw new common_1.BadRequestException('action.description is required');
        }
        else if (action.type === 'badge') {
            const act = action;
            if (!act.presetId || typeof act.presetId !== 'string')
                throw new common_1.BadRequestException('action.presetId is required');
        }
        else {
            throw new common_1.BadRequestException(`Unsupported action.type: ${action.type}`);
        }
        if (action.type === 'points') {
            const act = action;
            for (const u of users) {
                pointLogs.push({
                    studentId: u._id?.toString?.() || u.id,
                    points: act.points,
                    type: act.points >= 0 ? point_log_entity_1.PointType.REWARD : point_log_entity_1.PointType.VIOLATION,
                    category: act.category,
                    description: act.description,
                    addedBy: addedByUserId,
                    academicYear,
                });
            }
        }
        else if (action.type === 'badge') {
            const act = action;
            const preset = await this.actionPresetsService.findOne(act.presetId);
            const typeMap = {
                reward: point_log_entity_1.PointType.REWARD,
                violation: point_log_entity_1.PointType.VIOLATION,
                medal: point_log_entity_1.PointType.REWARD,
            };
            const mappedType = typeMap[preset.type] || point_log_entity_1.PointType.REWARD;
            for (const u of users) {
                pointLogs.push({
                    studentId: u._id?.toString?.() || u.id,
                    points: preset.points,
                    type: mappedType,
                    category: preset.category,
                    description: preset.description,
                    addedBy: user.id,
                    academicYear,
                    badge: preset.badgeTier
                        ? {
                            id: preset._id?.toString?.() || 'preset',
                            tier: preset.badgeTier,
                            reason: preset.name,
                            awardedBy: user.id,
                            awardedOn: new Date(),
                            icon: preset.icon,
                        }
                        : undefined,
                });
            }
        }
        const created = await this.pointLogsService.bulkCreate({ pointLogs });
        return { created: created.length };
    }
};
exports.DataController = DataController;
__decorate([
    (0, common_1.Get)('academic-years'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available academic years', description: 'Retrieve list of available academic years for filtering data.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Academic years retrieved successfully', type: [String] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], DataController.prototype, "getAcademicYears", null);
__decorate([
    (0, common_1.Post)('bulk-action'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a bulk action to a class', description: 'Apply points or a preset badge to all students in the specified class.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk action applied successfully' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                classId: { type: 'string' },
                action: {
                    oneOf: [
                        { $ref: (0, swagger_1.getSchemaPath)(PointsActionDto) },
                        { $ref: (0, swagger_1.getSchemaPath)(BadgeActionDto) },
                    ],
                    discriminator: { propertyName: 'type' },
                },
            },
            required: ['classId', 'action'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkActionBodyDto, Object]),
    __metadata("design:returntype", Promise)
], DataController.prototype, "bulkAction", null);
exports.DataController = DataController = __decorate([
    (0, swagger_1.ApiTags)('Data'),
    (0, swagger_1.ApiExtraModels)(PointsActionDto, BadgeActionDto),
    (0, common_1.Controller)('data'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        point_logs_service_1.PointLogsService,
        action_presets_service_1.ActionPresetsService])
], DataController);
//# sourceMappingURL=data.controller.js.map