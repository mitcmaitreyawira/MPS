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
exports.QueryPointLogsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const point_log_entity_1 = require("../entities/point-log.entity");
class QueryPointLogsDto {
    page = 1;
    limit = 10;
    search;
    type;
    studentId;
    category;
    addedBy;
    badgeTier;
    academicYear;
    minPoints;
    maxPoints;
    startDate;
    endDate;
    sortBy = 'timestamp';
    sortOrder = 'desc';
}
exports.QueryPointLogsDto = QueryPointLogsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryPointLogsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryPointLogsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search term for description or category',
        example: 'mathematics',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by point type',
        enum: point_log_entity_1.PointType,
        example: point_log_entity_1.PointType.REWARD,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(point_log_entity_1.PointType),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by student ID',
        example: '507f1f77bcf86cd799439012',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by category',
        example: 'Academic Achievement',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by who added the points',
        example: '507f1f77bcf86cd799439013',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "addedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by badge tier',
        enum: point_log_entity_1.BadgeTier,
        example: point_log_entity_1.BadgeTier.GOLD,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(point_log_entity_1.BadgeTier),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "badgeTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by academic year',
        example: '2023-2024',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum points value',
        example: 0,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryPointLogsDto.prototype, "minPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum points value',
        example: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryPointLogsDto.prototype, "maxPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date for filtering (ISO string)',
        example: '2024-01-01T00:00:00Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date for filtering (ISO string)',
        example: '2024-12-31T23:59:59Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort field',
        example: 'timestamp',
        enum: ['timestamp', 'points', 'studentId', 'type'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointLogsDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-point-logs.dto.js.map