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
exports.AwardSchema = exports.Award = exports.AwardStatus = exports.AwardTier = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AwardTier;
(function (AwardTier) {
    AwardTier["BRONZE"] = "bronze";
    AwardTier["SILVER"] = "silver";
    AwardTier["GOLD"] = "gold";
})(AwardTier || (exports.AwardTier = AwardTier = {}));
var AwardStatus;
(function (AwardStatus) {
    AwardStatus["ACTIVE"] = "active";
    AwardStatus["REVOKED"] = "revoked";
    AwardStatus["PENDING"] = "pending";
})(AwardStatus || (exports.AwardStatus = AwardStatus = {}));
let Award = class Award {
    name;
    description;
    tier;
    status;
    recipientId;
    awardedBy;
    awardedOn;
    reason;
    icon;
    academicYear;
    metadata;
    isTemplate;
    templateName;
    pointValue;
};
exports.Award = Award;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Award.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Award.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, enum: Object.values(AwardTier) }),
    __metadata("design:type", String)
], Award.prototype, "tier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, enum: Object.values(AwardStatus), default: AwardStatus.ACTIVE }),
    __metadata("design:type", String)
], Award.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Award.prototype, "recipientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Award.prototype, "awardedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Award.prototype, "awardedOn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Award.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Award.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Award.prototype, "academicYear", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: false }),
    __metadata("design:type", Object)
], Award.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Award.prototype, "isTemplate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Award.prototype, "templateName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: false }),
    __metadata("design:type", Number)
], Award.prototype, "pointValue", void 0);
exports.Award = Award = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Award);
exports.AwardSchema = mongoose_1.SchemaFactory.createForClass(Award);
exports.AwardSchema.index({ recipientId: 1 });
exports.AwardSchema.index({ awardedBy: 1 });
exports.AwardSchema.index({ tier: 1 });
exports.AwardSchema.index({ status: 1 });
exports.AwardSchema.index({ awardedOn: -1 });
exports.AwardSchema.index({ academicYear: 1 });
exports.AwardSchema.index({ isTemplate: 1 });
exports.AwardSchema.index({ recipientId: 1, awardedOn: -1 });
exports.AwardSchema.index({ tier: 1, status: 1 });
//# sourceMappingURL=award.schema.js.map