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
exports.CreateAwardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const award_entity_1 = require("../entities/award.entity");
class CreateAwardDto {
    name;
    description;
    tier;
    recipientId;
    reason;
    icon;
    academicYear;
    metadata;
    isTemplate;
    templateName;
}
exports.CreateAwardDto = CreateAwardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Award name',
        example: 'Outstanding Achievement'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Award description',
        example: 'Awarded for exceptional performance in academics'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: award_entity_1.AwardTier,
        description: 'Award tier',
        example: award_entity_1.AwardTier.GOLD
    }),
    (0, class_validator_1.IsEnum)(award_entity_1.AwardTier),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recipient user ID (not required for templates)',
        example: '507f1f77bcf86cd799439012'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for the award',
        example: 'Excellent performance in mathematics competition'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Award icon',
        example: 'trophy'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Academic year',
        example: '2023-2024'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        type: 'object'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAwardDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this is a template',
        example: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAwardDto.prototype, "isTemplate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Template name if this is a template',
        example: 'Academic Excellence Template'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAwardDto.prototype, "templateName", void 0);
//# sourceMappingURL=create-award.dto.js.map