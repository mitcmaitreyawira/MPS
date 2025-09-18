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
exports.CreateQuestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const quest_entity_1 = require("../entities/quest.entity");
class CreateQuestDto {
    title;
    description;
    points;
    supervisorId;
    requiredPoints;
    badgeTier;
    badgeReason;
    badgeIcon;
    slotsAvailable;
    expiresAt;
    academicYear;
    isActive;
}
exports.CreateQuestDto = CreateQuestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the quest',
        example: 'Community Service Project',
        minLength: 3,
        maxLength: 100
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Quest title must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Quest title must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed description of the quest',
        example: 'Help organize the school library for 2 hours',
        minLength: 10,
        maxLength: 500
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Quest description must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Quest description must not exceed 500 characters' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points awarded for completing this quest',
        example: 50,
        minimum: 1,
        maximum: 1000
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Points must be a valid number' }),
    (0, class_validator_1.Min)(1, { message: 'Points must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Points must not exceed 100' }),
    __metadata("design:type", Number)
], CreateQuestDto.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the teacher supervising this quest',
        example: 'teacher_123456789'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "supervisorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Required points to join this quest',
        example: 100,
        minimum: 0,
        maximum: 10000
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Required points must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Required points must be at least 0' }),
    (0, class_validator_1.Max)(100, { message: 'Required points must not exceed 100' }),
    __metadata("design:type", Number)
], CreateQuestDto.prototype, "requiredPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Badge tier awarded upon completion',
        enum: quest_entity_1.BadgeTier,
        example: quest_entity_1.BadgeTier.GOLD
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(quest_entity_1.BadgeTier, { message: 'Badge tier must be bronze, silver, or gold' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "badgeTier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for the badge award',
        example: 'Outstanding community service',
        maxLength: 200
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200, { message: 'Badge reason must not exceed 200 characters' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "badgeReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Icon for the badge',
        example: 'star',
        maxLength: 50
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Badge icon must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "badgeIcon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of available slots for participants',
        example: 10,
        minimum: 1,
        maximum: 1000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Slots available must be a valid number' }),
    (0, class_validator_1.Min)(1, { message: 'Slots available must be at least 1' }),
    (0, class_validator_1.Max)(1000, { message: 'Slots available must not exceed 1000' }),
    __metadata("design:type", Number)
], CreateQuestDto.prototype, "slotsAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Quest expiration date (ISO string)',
        example: '2024-12-31T23:59:59Z'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Expiration date must be a valid ISO date string' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Academic year for this quest',
        example: '2024-2025',
        maxLength: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20, { message: 'Academic year must not exceed 20 characters' }),
    __metadata("design:type", String)
], CreateQuestDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the quest is currently active',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateQuestDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-quest.dto.js.map