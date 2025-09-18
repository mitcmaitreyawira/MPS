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
exports.QuestParticipant = exports.QuestCompletionStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
var QuestCompletionStatus;
(function (QuestCompletionStatus) {
    QuestCompletionStatus["IN_PROGRESS"] = "in_progress";
    QuestCompletionStatus["SUBMITTED_FOR_REVIEW"] = "submitted_for_review";
    QuestCompletionStatus["COMPLETED"] = "completed";
})(QuestCompletionStatus || (exports.QuestCompletionStatus = QuestCompletionStatus = {}));
class QuestParticipant {
    questId;
    studentId;
    joinedAt;
    status;
    submittedAt;
    completedAt;
    reviewNotes;
    academicYear;
}
exports.QuestParticipant = QuestParticipant;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the quest',
        example: 'quest_123456789'
    }),
    __metadata("design:type", String)
], QuestParticipant.prototype, "questId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the student participant',
        example: 'student_123456789'
    }),
    __metadata("design:type", String)
], QuestParticipant.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the student joined the quest',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], QuestParticipant.prototype, "joinedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of quest completion',
        enum: QuestCompletionStatus,
        example: QuestCompletionStatus.IN_PROGRESS
    }),
    __metadata("design:type", String)
], QuestParticipant.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the quest was submitted for review',
        required: false,
        example: '2024-01-20T15:45:00Z'
    }),
    __metadata("design:type", Date)
], QuestParticipant.prototype, "submittedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the quest was completed',
        required: false,
        example: '2024-01-22T09:15:00Z'
    }),
    __metadata("design:type", Date)
], QuestParticipant.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Review notes from the supervisor',
        required: false,
        example: 'Excellent work on organizing the library'
    }),
    __metadata("design:type", String)
], QuestParticipant.prototype, "reviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this participation',
        required: false,
        example: '2024-2025'
    }),
    __metadata("design:type", String)
], QuestParticipant.prototype, "academicYear", void 0);
//# sourceMappingURL=quest-participant.entity.js.map