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
exports.QueryAppealsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const appeal_entity_1 = require("../entities/appeal.entity");
class QueryAppealsDto {
    page = 1;
    limit = 10;
    search;
    status;
    studentId;
    reviewedBy;
    academicYear;
    sortBy = 'submittedAt';
    sortOrder = 'desc';
}
exports.QueryAppealsDto = QueryAppealsDto;
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
], QueryAppealsDto.prototype, "page", void 0);
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
], QueryAppealsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search term for appeal reason',
        example: 'unfair',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by appeal status',
        enum: appeal_entity_1.AppealStatus,
        example: appeal_entity_1.AppealStatus.PENDING,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(appeal_entity_1.AppealStatus),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by student ID',
        example: '507f1f77bcf86cd799439012',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by reviewer ID',
        example: '507f1f77bcf86cd799439013',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "reviewedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by academic year',
        example: '2023-2024',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort field',
        example: 'submittedAt',
        enum: ['submittedAt', 'reviewedAt', 'status'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "sortBy", void 0);
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
], QueryAppealsDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-appeals.dto.js.map