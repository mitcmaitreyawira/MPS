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
exports.AWARD_POINT_VALUES = exports.Award = exports.AwardStatus = exports.AwardTier = void 0;
const swagger_1 = require("@nestjs/swagger");
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
class Award {
    id;
    name;
    description;
    tier;
    status;
    recipientId;
    recipientName;
    awardedBy;
    awardedByName;
    awardedOn;
    reason;
    icon;
    academicYear;
    metadata;
    isTemplate;
    templateName;
    pointValue;
    createdAt;
    updatedAt;
}
exports.Award = Award;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Award ID' }),
    __metadata("design:type", String)
], Award.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Award name' }),
    __metadata("design:type", String)
], Award.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Award description' }),
    __metadata("design:type", String)
], Award.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AwardTier, description: 'Award tier' }),
    __metadata("design:type", String)
], Award.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AwardStatus, description: 'Award status' }),
    __metadata("design:type", String)
], Award.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient user ID' }),
    __metadata("design:type", String)
], Award.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient name' }),
    __metadata("design:type", String)
], Award.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who awarded this' }),
    __metadata("design:type", String)
], Award.prototype, "awardedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of user who awarded this' }),
    __metadata("design:type", String)
], Award.prototype, "awardedByName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when award was given' }),
    __metadata("design:type", Date)
], Award.prototype, "awardedOn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for the award' }),
    __metadata("design:type", String)
], Award.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Award icon', required: false }),
    __metadata("design:type", String)
], Award.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Academic year', required: false }),
    __metadata("design:type", String)
], Award.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata', required: false }),
    __metadata("design:type", Object)
], Award.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a template', required: false }),
    __metadata("design:type", Boolean)
], Award.prototype, "isTemplate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name if this is a template', required: false }),
    __metadata("design:type", String)
], Award.prototype, "templateName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Point value of the award', required: false }),
    __metadata("design:type", Number)
], Award.prototype, "pointValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp', required: false }),
    __metadata("design:type", Date)
], Award.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp', required: false }),
    __metadata("design:type", Date)
], Award.prototype, "updatedAt", void 0);
exports.AWARD_POINT_VALUES = {
    [AwardTier.GOLD]: 5,
    [AwardTier.SILVER]: 3,
    [AwardTier.BRONZE]: 1,
};
//# sourceMappingURL=award.entity.js.map