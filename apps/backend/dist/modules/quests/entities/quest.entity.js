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
exports.Quest = exports.BadgeTier = void 0;
const swagger_1 = require("@nestjs/swagger");
var BadgeTier;
(function (BadgeTier) {
    BadgeTier["BRONZE"] = "bronze";
    BadgeTier["SILVER"] = "silver";
    BadgeTier["GOLD"] = "gold";
})(BadgeTier || (exports.BadgeTier = BadgeTier = {}));
class Quest {
    id;
    title;
    description;
    points;
    createdBy;
    createdAt;
    isActive;
    supervisorId;
    requiredPoints;
    badgeTier;
    badgeReason;
    badgeIcon;
    slotsAvailable;
    expiresAt;
    academicYear;
    participantCount;
    completionCount;
}
exports.Quest = Quest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the quest',
        example: 'quest_123456789'
    }),
    __metadata("design:type", String)
], Quest.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the quest',
        example: 'Community Service Project'
    }),
    __metadata("design:type", String)
], Quest.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed description of the quest',
        example: 'Help organize the school library for 2 hours'
    }),
    __metadata("design:type", String)
], Quest.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points awarded for completing this quest',
        example: 50
    }),
    __metadata("design:type", Number)
], Quest.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the admin who created this quest',
        example: 'admin_123456789'
    }),
    __metadata("design:type", String)
], Quest.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the quest was created',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], Quest.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the quest is currently active',
        example: true
    }),
    __metadata("design:type", Boolean)
], Quest.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the teacher supervising this quest',
        example: 'teacher_123456789'
    }),
    __metadata("design:type", String)
], Quest.prototype, "supervisorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Required points to join this quest',
        example: 100
    }),
    __metadata("design:type", Number)
], Quest.prototype, "requiredPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Badge tier awarded upon completion',
        enum: BadgeTier,
        required: false,
        example: BadgeTier.GOLD
    }),
    __metadata("design:type", String)
], Quest.prototype, "badgeTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for the badge award',
        required: false,
        example: 'Outstanding community service'
    }),
    __metadata("design:type", String)
], Quest.prototype, "badgeReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Icon for the badge',
        required: false,
        example: 'star'
    }),
    __metadata("design:type", String)
], Quest.prototype, "badgeIcon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of available slots for participants',
        required: false,
        example: 10
    }),
    __metadata("design:type", Number)
], Quest.prototype, "slotsAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quest expiration date',
        required: false,
        example: '2024-12-31T23:59:59Z'
    }),
    __metadata("design:type", Date)
], Quest.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year for this quest',
        required: false,
        example: '2024-2025'
    }),
    __metadata("design:type", String)
], Quest.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of participants in this quest',
        required: false,
        example: 5
    }),
    __metadata("design:type", Number)
], Quest.prototype, "participantCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of participants who completed this quest',
        required: false,
        example: 3
    }),
    __metadata("design:type", Number)
], Quest.prototype, "completionCount", void 0);
//# sourceMappingURL=quest.entity.js.map