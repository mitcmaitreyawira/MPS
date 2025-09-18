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
exports.QuestParticipantSchema = exports.QuestParticipant = exports.QuestCompletionStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QuestCompletionStatus;
(function (QuestCompletionStatus) {
    QuestCompletionStatus["IN_PROGRESS"] = "in_progress";
    QuestCompletionStatus["SUBMITTED_FOR_REVIEW"] = "submitted_for_review";
    QuestCompletionStatus["COMPLETED"] = "completed";
})(QuestCompletionStatus || (exports.QuestCompletionStatus = QuestCompletionStatus = {}));
let QuestParticipant = class QuestParticipant {
    questId;
    studentId;
    status;
    submittedAt;
    completedAt;
    reviewNotes;
    reviewedBy;
    reviewedAt;
    submissionNotes;
    attachments;
    academicYear;
    pointLogId;
};
exports.QuestParticipant = QuestParticipant;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Quest', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QuestParticipant.prototype, "questId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QuestParticipant.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: QuestCompletionStatus, default: QuestCompletionStatus.IN_PROGRESS }),
    __metadata("design:type", String)
], QuestParticipant.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], QuestParticipant.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], QuestParticipant.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QuestParticipant.prototype, "reviewNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QuestParticipant.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], QuestParticipant.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QuestParticipant.prototype, "submissionNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], QuestParticipant.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QuestParticipant.prototype, "academicYear", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'PointLog' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QuestParticipant.prototype, "pointLogId", void 0);
exports.QuestParticipant = QuestParticipant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QuestParticipant);
exports.QuestParticipantSchema = mongoose_1.SchemaFactory.createForClass(QuestParticipant);
exports.QuestParticipantSchema.index({ questId: 1, studentId: 1 }, { unique: true });
exports.QuestParticipantSchema.index({ questId: 1 });
exports.QuestParticipantSchema.index({ studentId: 1 });
exports.QuestParticipantSchema.index({ status: 1 });
exports.QuestParticipantSchema.index({ createdAt: -1 });
exports.QuestParticipantSchema.index({ academicYear: 1 });
exports.QuestParticipantSchema.index({ questId: 1, status: 1 });
exports.QuestParticipantSchema.index({ studentId: 1, status: 1 });
exports.QuestParticipantSchema.index({ studentId: 1, academicYear: 1 });
exports.QuestParticipantSchema.index({ submittedAt: 1 });
exports.QuestParticipantSchema.index({ completedAt: 1 });
exports.QuestParticipantSchema.virtual('duration').get(function () {
    if (this.completedAt && this.createdAt) {
        return this.completedAt.getTime() - this.createdAt.getTime();
    }
    return null;
});
exports.QuestParticipantSchema.pre('save', function (next) {
    const now = new Date();
    if (this.isModified('status') && this.status === QuestCompletionStatus.SUBMITTED_FOR_REVIEW && !this.submittedAt) {
        this.submittedAt = now;
    }
    if (this.isModified('status') && this.status === QuestCompletionStatus.COMPLETED && !this.completedAt) {
        this.completedAt = now;
    }
    if (!this.academicYear) {
        const year = now.getFullYear();
        const month = now.getMonth();
        const academicStartYear = month >= 7 ? year : year - 1;
        this.academicYear = `${academicStartYear}-${academicStartYear + 1}`;
    }
    next();
});
//# sourceMappingURL=quest-participant.schema.js.map