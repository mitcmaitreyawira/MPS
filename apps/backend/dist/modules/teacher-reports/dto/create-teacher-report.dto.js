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
exports.CreateTeacherReportDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTeacherReportDto {
    submittedByUserId;
    isAnonymous;
    targetTeacherId;
    details;
    academicYear;
}
exports.CreateTeacherReportDto = CreateTeacherReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who submitted the report (automatically set from authenticated user)',
        example: 'user_123456789',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeacherReportDto.prototype, "submittedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the report was submitted anonymously',
        example: false
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTeacherReportDto.prototype, "isAnonymous", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the teacher being reported',
        example: 'teacher_123456789'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTeacherReportDto.prototype, "targetTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Details of the report',
        example: 'Teacher was consistently late to class and unprepared'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateTeacherReportDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this report',
        example: '2024-2025',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeacherReportDto.prototype, "academicYear", void 0);
//# sourceMappingURL=create-teacher-report.dto.js.map