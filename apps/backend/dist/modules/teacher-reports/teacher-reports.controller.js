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
exports.TeacherReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teacher_reports_service_1 = require("./teacher-reports.service");
const dto_1 = require("./dto");
const teacher_report_entity_1 = require("./entities/teacher-report.entity");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let TeacherReportsController = class TeacherReportsController {
    teacherReportsService;
    constructor(teacherReportsService) {
        this.teacherReportsService = teacherReportsService;
    }
    async create(createTeacherReportDto, req) {
        const submittedByUserId = req.user?.sub;
        const reportWithUserId = {
            ...createTeacherReportDto,
            submittedByUserId
        };
        return this.teacherReportsService.create(reportWithUserId);
    }
    async findAll(query) {
        return this.teacherReportsService.findAll(query);
    }
    async getStats() {
        return this.teacherReportsService.getStats();
    }
    async findOne(id) {
        return this.teacherReportsService.findOne(id);
    }
    async update(id, updateTeacherReportDto) {
        return this.teacherReportsService.update(id, updateTeacherReportDto);
    }
    async review(id) {
        return this.teacherReportsService.update(id, {
            status: teacher_report_entity_1.ReportStatus.REVIEWED,
            reviewedAt: new Date()
        });
    }
    async remove(id) {
        return this.teacherReportsService.remove(id);
    }
};
exports.TeacherReportsController = TeacherReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new teacher report' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Teacher report created successfully',
        type: teacher_report_entity_1.TeacherReport
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)('student', 'teacher', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTeacherReportDto, Object]),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all teacher reports with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher reports retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/TeacherReport' }
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryTeacherReportsDto]),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get teacher report statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                byStatus: {
                    type: 'object',
                    additionalProperties: { type: 'number' }
                },
                byTeacher: {
                    type: 'object',
                    additionalProperties: { type: 'number' }
                },
                recentReports: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a teacher report by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher report retrieved successfully',
        type: teacher_report_entity_1.TeacherReport
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher report not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a teacher report' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher report updated successfully',
        type: teacher_report_entity_1.TeacherReport
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher report not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTeacherReportDto]),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a teacher report as reviewed' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher report marked as reviewed successfully',
        type: teacher_report_entity_1.TeacherReport
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher report not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "review", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a teacher report' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Teacher report deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher report not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherReportsController.prototype, "remove", null);
exports.TeacherReportsController = TeacherReportsController = __decorate([
    (0, swagger_1.ApiTags)('teacher-reports'),
    (0, common_1.Controller)('teacher-reports'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [teacher_reports_service_1.TeacherReportsService])
], TeacherReportsController);
//# sourceMappingURL=teacher-reports.controller.js.map