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
exports.UpdateTeacherReportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_teacher_report_dto_1 = require("./create-teacher-report.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const teacher_report_entity_1 = require("../entities/teacher-report.entity");
class UpdateTeacherReportDto extends (0, swagger_1.PartialType)(create_teacher_report_dto_1.CreateTeacherReportDto) {
    status;
    response;
    reviewedByUserId;
}
exports.UpdateTeacherReportDto = UpdateTeacherReportDto;
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Status of the report',
        enum: teacher_report_entity_1.ReportStatus,
        example: teacher_report_entity_1.ReportStatus.REVIEWED,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTeacherReportDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Response from administration',
        example: 'We have reviewed your report and will take appropriate action.',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateTeacherReportDto.prototype, "response", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'ID of the user who reviewed the report',
        example: 'admin_123456789',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherReportDto.prototype, "reviewedByUserId", void 0);
//# sourceMappingURL=update-teacher-report.dto.js.map