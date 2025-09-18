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
exports.QueryAwardsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const award_entity_1 = require("../entities/award.entity");
class QueryAwardsDto {
    page = 1;
    limit = 10;
    recipientId;
    awardedBy;
    tier;
    status;
    academicYear;
    search;
    isTemplate;
    sortBy = 'awardedOn';
    sortOrder = 'desc';
}
exports.QueryAwardsDto = QueryAwardsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Page must be a valid number' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    __metadata("design:type", Number)
], QueryAwardsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Limit must be a valid number' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit cannot exceed 100' }),
    __metadata("design:type", Number)
], QueryAwardsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by recipient ID',
        example: '507f1f77bcf86cd799439012'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by user who awarded',
        example: '507f1f77bcf86cd799439013'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "awardedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: award_entity_1.AwardTier,
        description: 'Filter by award tier',
        example: award_entity_1.AwardTier.GOLD
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(award_entity_1.AwardTier),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: award_entity_1.AwardStatus,
        description: 'Filter by award status',
        example: award_entity_1.AwardStatus.ACTIVE
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(award_entity_1.AwardStatus),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by academic year',
        example: '2023-2024'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search in award name and description',
        example: 'excellence'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter templates only',
        example: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryAwardsDto.prototype, "isTemplate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort field',
        example: 'awardedOn',
        enum: ['name', 'tier', 'awardedOn', 'createdAt']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAwardsDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-awards.dto.js.map