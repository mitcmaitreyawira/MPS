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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryTeacherReportsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const teacher_report_entity_1 = require("../entities/teacher-report.entity");
class QueryTeacherReportsDto {
    page = 1;
    limit = 10;
    search;
    status;
    submittedByUserId;
    targetTeacherId;
    isAnonymous;
    academicYear;
    sortBy = 'timestamp';
    sortOrder = 'desc';
}
exports.QueryTeacherReportsDto = QueryTeacherReportsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        required: false,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryTeacherReportsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
        required: false,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryTeacherReportsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search term for report details',
        example: 'late to class',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by report status',
        enum: teacher_report_entity_1.ReportStatus,
        example: teacher_report_entity_1.ReportStatus.NEW,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(teacher_report_entity_1.ReportStatus),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by submitter user ID',
        example: 'user_123456789',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "submittedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by target teacher ID',
        example: 'teacher_123456789',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "targetTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by anonymous reports only',
        example: true,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryTeacherReportsDto.prototype, "isAnonymous", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by academic year',
        example: '2024-2025',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort field',
        example: 'timestamp',
        required: false,
        enum: ['timestamp', 'status', 'targetTeacherId']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        example: 'desc',
        required: false,
        enum: ['asc', 'desc']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTeacherReportsDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-teacher-reports.dto.js.map