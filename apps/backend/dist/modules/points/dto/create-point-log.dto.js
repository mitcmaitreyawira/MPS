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
exports.CreatePointLogDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const point_log_entity_1 = require("../entities/point-log.entity");
class CreatePointLogDto {
    studentId;
    points;
    type;
    category;
    description;
    addedBy;
    badge;
    academicYear;
}
exports.CreatePointLogDto = CreatePointLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the student receiving/losing points',
        example: '507f1f77bcf86cd799439012',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePointLogDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of points (positive for earned, negative for deducted)',
        example: 10,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePointLogDto.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of point transaction',
        enum: point_log_entity_1.PointType,
        example: point_log_entity_1.PointType.REWARD,
    }),
    (0, class_validator_1.IsEnum)(point_log_entity_1.PointType),
    __metadata("design:type", String)
], CreatePointLogDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category of the point transaction',
        example: 'Academic Achievement',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePointLogDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of why points were awarded/deducted',
        example: 'Excellent performance in mathematics quiz',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePointLogDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who added these points',
        example: '507f1f77bcf86cd799439013',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePointLogDto.prototype, "addedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Badge information if this point log includes a badge',
        required: false,
        type: 'object',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePointLogDto.prototype, "badge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this point log',
        example: '2023-2024',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePointLogDto.prototype, "academicYear", void 0);
//# sourceMappingURL=create-point-log.dto.js.map