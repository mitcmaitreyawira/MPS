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
exports.PointLog = exports.BadgeTier = exports.PointType = void 0;
const swagger_1 = require("@nestjs/swagger");
var PointType;
(function (PointType) {
    PointType["REWARD"] = "reward";
    PointType["VIOLATION"] = "violation";
    PointType["QUEST"] = "quest";
    PointType["APPEAL_REVERSAL"] = "appeal_reversal";
    PointType["OVERRIDE"] = "override";
})(PointType || (exports.PointType = PointType = {}));
var BadgeTier;
(function (BadgeTier) {
    BadgeTier["BRONZE"] = "bronze";
    BadgeTier["SILVER"] = "silver";
    BadgeTier["GOLD"] = "gold";
})(BadgeTier || (exports.BadgeTier = BadgeTier = {}));
class PointLog {
    id;
    studentId;
    points;
    type;
    category;
    description;
    timestamp;
    addedBy;
    badge;
    academicYear;
}
exports.PointLog = PointLog;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the point log',
        example: 'pointlog_123456789'
    }),
    __metadata("design:type", String)
], PointLog.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the student receiving the points',
        example: 'student_123456789'
    }),
    __metadata("design:type", String)
], PointLog.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of points (positive for rewards, negative for violations)',
        example: 10
    }),
    __metadata("design:type", Number)
], PointLog.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of point transaction',
        enum: PointType,
        example: PointType.REWARD
    }),
    __metadata("design:type", String)
], PointLog.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category of the point transaction',
        example: 'Academic Excellence'
    }),
    __metadata("design:type", String)
], PointLog.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of why points were awarded/deducted',
        example: 'Excellent performance in mathematics quiz'
    }),
    __metadata("design:type", String)
], PointLog.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the points were logged',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], PointLog.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who added these points',
        example: 'teacher_123456789'
    }),
    __metadata("design:type", String)
], PointLog.prototype, "addedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Badge awarded with these points',
        required: false,
        type: 'object'
    }),
    __metadata("design:type", Object)
], PointLog.prototype, "badge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this point log',
        required: false,
        example: '2024-2025'
    }),
    __metadata("design:type", String)
], PointLog.prototype, "academicYear", void 0);
//# sourceMappingURL=point-log.entity.js.map