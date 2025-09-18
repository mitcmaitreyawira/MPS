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
exports.QueryQuestsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const quest_entity_1 = require("../entities/quest.entity");
class QueryQuestsDto {
    page = 1;
    limit = 10;
    search;
    isActive;
    supervisorId;
    badgeTier;
    academicYear;
    minPoints;
    maxPoints;
    sortBy = 'createdAt';
    sortOrder = 'desc';
    includeExpired;
}
exports.QueryQuestsDto = QueryQuestsDto;
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
], QueryQuestsDto.prototype, "page", void 0);
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
    (0, class_validator_1.Max)(100, { message: 'Limit must not exceed 100' }),
    __metadata("design:type", Number)
], QueryQuestsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search term for quest title or description',
        example: 'community service'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQuestsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by active status',
        example: true
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
], QueryQuestsDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by supervisor ID',
        example: 'teacher_123456789'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQuestsDto.prototype, "supervisorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by badge tier',
        enum: quest_entity_1.BadgeTier,
        example: quest_entity_1.BadgeTier.GOLD
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(quest_entity_1.BadgeTier, { message: 'Badge tier must be bronze, silver, or gold' }),
    __metadata("design:type", String)
], QueryQuestsDto.prototype, "badgeTier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by academic year',
        example: '2024-2025'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQuestsDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum points required',
        example: 50
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Min points must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Min points must be at least 0' }),
    __metadata("design:type", Number)
], QueryQuestsDto.prototype, "minPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum points required',
        example: 500
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Max points must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Max points must be at least 0' }),
    __metadata("design:type", Number)
], QueryQuestsDto.prototype, "maxPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort field',
        example: 'createdAt',
        enum: ['title', 'points', 'createdAt', 'expiresAt']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQuestsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQuestsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Include expired quests in results',
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
], QueryQuestsDto.prototype, "includeExpired", void 0);
//# sourceMappingURL=query-quests.dto.js.map