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
exports.QueryClassesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class QueryClassesDto {
    page = 1;
    limit = 10;
    search;
    headTeacherId;
    sortBy = 'createdAt';
    sortOrder = 'desc';
}
exports.QueryClassesDto = QueryClassesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number for pagination', minimum: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Page must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    __metadata("design:type", Number)
], QueryClassesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Limit must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit must not exceed 100' }),
    __metadata("design:type", Number)
], QueryClassesDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for class name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryClassesDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by head teacher ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'Head teacher ID must be a valid MongoDB ObjectId' }),
    __metadata("design:type", String)
], QueryClassesDto.prototype, "headTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field', enum: ['createdAt', 'updatedAt', 'name'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['createdAt', 'updatedAt', 'name'], {
        message: 'Invalid sort field'
    }),
    __metadata("design:type", String)
], QueryClassesDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc'], { message: 'Sort order must be asc or desc' }),
    __metadata("design:type", String)
], QueryClassesDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-classes.dto.js.map