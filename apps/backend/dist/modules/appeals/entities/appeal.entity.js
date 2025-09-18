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
exports.Appeal = exports.AppealStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
var AppealStatus;
(function (AppealStatus) {
    AppealStatus["PENDING"] = "pending";
    AppealStatus["APPROVED"] = "approved";
    AppealStatus["REJECTED"] = "rejected";
})(AppealStatus || (exports.AppealStatus = AppealStatus = {}));
class Appeal {
    id;
    pointLogId;
    studentId;
    reason;
    status;
    submittedAt;
    reviewedBy;
    reviewedAt;
    reviewNotes;
    academicYear;
}
exports.Appeal = Appeal;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the appeal',
        example: 'appeal_123456789'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the point log being appealed',
        example: 'pointlog_123456789'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "pointLogId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the student making the appeal',
        example: 'student_123456789'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for the appeal',
        example: 'I was not present during the incident'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the appeal',
        enum: AppealStatus,
        example: AppealStatus.PENDING
    }),
    __metadata("design:type", String)
], Appeal.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the appeal was submitted',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], Appeal.prototype, "submittedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the admin/teacher who reviewed the appeal',
        required: false,
        example: 'admin_123456789'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "reviewedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the appeal was reviewed',
        required: false,
        example: '2024-01-16T14:20:00Z'
    }),
    __metadata("design:type", Date)
], Appeal.prototype, "reviewedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Review notes or response to the appeal',
        required: false,
        example: 'Appeal approved. Points have been restored.'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "reviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this appeal',
        required: false,
        example: '2024-2025'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "academicYear", void 0);
//# sourceMappingURL=appeal.entity.js.map