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
exports.QueryUsersDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const validation_constants_1 = require("../../../common/validation.constants");
class QueryUsersDto {
    page = 1;
    limit = 10;
    search;
    role;
    classId;
    sortBy = 'createdAt';
    sortOrder = 'desc';
    createdAfter;
    createdBefore;
    lastLoginAfter;
    lastLoginBefore;
    includeProfile = false;
    includePreferences = false;
    includeArchived = false;
}
exports.QueryUsersDto = QueryUsersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number for pagination', minimum: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Page must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Limit must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit must not exceed 100' }),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by user role', enum: validation_constants_1.ALLOWED_VALUES.USER_ROLES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.USER_ROLES, { message: 'Invalid role provided' }),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter users by class ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field', enum: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'lastLoginAt', 'nisn', 'username'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['createdAt', 'updatedAt', 'firstName', 'lastName', 'lastLoginAt', 'nisn', 'username'], {
        message: 'Invalid sort field'
    }),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc'], { message: 'Sort order must be asc or desc' }),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter users created after this date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "createdAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter users created before this date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "createdBefore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter users who logged in after this date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "lastLoginAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter users who logged in before this date (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "lastLoginBefore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include user profile information', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryUsersDto.prototype, "includeProfile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include user preferences', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryUsersDto.prototype, "includePreferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include archived users in results', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryUsersDto.prototype, "includeArchived", void 0);
//# sourceMappingURL=query-users.dto.js.map