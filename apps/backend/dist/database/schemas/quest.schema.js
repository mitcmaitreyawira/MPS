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
exports.QuestSchema = exports.Quest = exports.BadgeTier = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var BadgeTier;
(function (BadgeTier) {
    BadgeTier["BRONZE"] = "bronze";
    BadgeTier["SILVER"] = "silver";
    BadgeTier["GOLD"] = "gold";
})(BadgeTier || (exports.BadgeTier = BadgeTier = {}));
let Quest = class Quest {
    title;
    description;
    points;
    createdBy;
    supervisorId;
    requiredPoints;
    isActive;
    badgeTier;
    badgeReason;
    badgeIcon;
    slotsAvailable;
    expiresAt;
    academicYear;
    participantCount;
    completionCount;
};
exports.Quest = Quest;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Quest.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Quest.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Quest.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quest.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quest.prototype, "supervisorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Quest.prototype, "requiredPoints", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Quest.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BadgeTier }),
    __metadata("design:type", String)
], Quest.prototype, "badgeTier", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Quest.prototype, "badgeReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Quest.prototype, "badgeIcon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1 }),
    __metadata("design:type", Number)
], Quest.prototype, "slotsAvailable", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Quest.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Quest.prototype, "academicYear", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Quest.prototype, "participantCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Quest.prototype, "completionCount", void 0);
exports.Quest = Quest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Quest);
exports.QuestSchema = mongoose_1.SchemaFactory.createForClass(Quest);
exports.QuestSchema.index({ supervisorId: 1 });
exports.QuestSchema.index({ isActive: 1 });
exports.QuestSchema.index({ createdAt: -1 });
exports.QuestSchema.index({ expiresAt: 1 });
exports.QuestSchema.index({ academicYear: 1 });
exports.QuestSchema.index({ supervisorId: 1, isActive: 1 });
exports.QuestSchema.index({ isActive: 1, expiresAt: 1 });
exports.QuestSchema.index({ title: 'text', description: 'text' });
exports.QuestSchema.virtual('isExpired').get(function () {
    return this.expiresAt ? new Date() > this.expiresAt : false;
});
exports.QuestSchema.virtual('availableSlots').get(function () {
    if (!this.slotsAvailable)
        return Infinity;
    return Math.max(0, this.slotsAvailable - this.participantCount);
});
exports.QuestSchema.pre('save', function (next) {
    if (!this.academicYear) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const academicStartYear = month >= 7 ? year : year - 1;
        this.academicYear = `${academicStartYear}-${academicStartYear + 1}`;
    }
    next();
});
//# sourceMappingURL=quest.schema.js.map