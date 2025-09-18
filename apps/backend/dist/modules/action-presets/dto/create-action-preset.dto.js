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
exports.CreateActionPresetDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const mongoose_1 = require("mongoose");
const action_preset_schema_1 = require("../../../database/schemas/action-preset.schema");
class CreateActionPresetDto {
    type;
    name;
    category;
    description;
    points;
    badgeTier;
    icon;
    isArchived;
    createdBy;
}
exports.CreateActionPresetDto = CreateActionPresetDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of action preset',
        enum: action_preset_schema_1.ActionType,
        example: action_preset_schema_1.ActionType.REWARD,
    }),
    (0, class_validator_1.IsEnum)(action_preset_schema_1.ActionType),
    __metadata("design:type", String)
], CreateActionPresetDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the action preset',
        example: 'Excellent Participation',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateActionPresetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category of the action preset',
        example: 'Academic Excellence',
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateActionPresetDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the action preset',
        example: 'Awarded for outstanding participation in class discussions',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateActionPresetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points awarded/deducted for this action',
        example: 10,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateActionPresetDto.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Badge tier (only for MEDAL type)',
        enum: action_preset_schema_1.BadgeTier,
        example: action_preset_schema_1.BadgeTier.GOLD,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(action_preset_schema_1.BadgeTier),
    __metadata("design:type", String)
], CreateActionPresetDto.prototype, "badgeTier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Icon identifier (only for MEDAL type)',
        example: 'star',
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateActionPresetDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the action preset is archived',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActionPresetDto.prototype, "isArchived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who created this action preset',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_transformer_1.Transform)(({ value }) => new mongoose_1.Types.ObjectId(value)),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], CreateActionPresetDto.prototype, "createdBy", void 0);
//# sourceMappingURL=create-action-preset.dto.js.map