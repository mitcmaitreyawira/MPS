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
exports.TeacherReport = exports.ReportStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["NEW"] = "new";
    ReportStatus["REVIEWED"] = "reviewed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
class TeacherReport {
    id;
    submittedByUserId;
    isAnonymous;
    targetTeacherId;
    details;
    timestamp;
    status;
    response;
    reviewedByUserId;
    reviewedAt;
    academicYear;
}
exports.TeacherReport = TeacherReport;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the teacher report',
        example: 'report_123456789'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who submitted the report',
        example: 'user_123456789'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "submittedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the report was submitted anonymously',
        example: false
    }),
    __metadata("design:type", Boolean)
], TeacherReport.prototype, "isAnonymous", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the teacher being reported',
        example: 'teacher_123456789'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "targetTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Details of the report',
        example: 'Teacher was consistently late to class and unprepared'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the report was submitted',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], TeacherReport.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the report',
        enum: ReportStatus,
        example: ReportStatus.NEW
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response from administration',
        required: false,
        example: 'We have reviewed your report and will take appropriate action.'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "response", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who reviewed the report',
        required: false,
        example: 'admin_123456789'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "reviewedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the report was reviewed',
        required: false,
        example: '2024-01-25T09:00:00Z'
    }),
    __metadata("design:type", Date)
], TeacherReport.prototype, "reviewedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this report',
        required: false,
        example: '2024-2025'
    }),
    __metadata("design:type", String)
], TeacherReport.prototype, "academicYear", void 0);
//# sourceMappingURL=teacher-report.entity.js.map