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
exports.ActionPresetSchema = exports.ActionPreset = exports.BadgeTier = exports.ActionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ActionType;
(function (ActionType) {
    ActionType["REWARD"] = "reward";
    ActionType["VIOLATION"] = "violation";
    ActionType["MEDAL"] = "medal";
})(ActionType || (exports.ActionType = ActionType = {}));
var BadgeTier;
(function (BadgeTier) {
    BadgeTier["BRONZE"] = "bronze";
    BadgeTier["SILVER"] = "silver";
    BadgeTier["GOLD"] = "gold";
})(BadgeTier || (exports.BadgeTier = BadgeTier = {}));
let ActionPreset = class ActionPreset {
    type;
    name;
    category;
    description;
    points;
    badgeTier;
    icon;
    isArchived;
    createdBy;
    createdAt;
    updatedAt;
};
exports.ActionPreset = ActionPreset;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ActionType }),
    __metadata("design:type", String)
], ActionPreset.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ActionPreset.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ActionPreset.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ActionPreset.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ActionPreset.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BadgeTier }),
    __metadata("design:type", String)
], ActionPreset.prototype, "badgeTier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ActionPreset.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ActionPreset.prototype, "isArchived", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ActionPreset.prototype, "createdBy", void 0);
exports.ActionPreset = ActionPreset = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ActionPreset);
exports.ActionPresetSchema = mongoose_1.SchemaFactory.createForClass(ActionPreset);
exports.ActionPresetSchema.index({ type: 1 });
exports.ActionPresetSchema.index({ category: 1 });
exports.ActionPresetSchema.index({ isArchived: 1 });
exports.ActionPresetSchema.index({ createdBy: 1 });
exports.ActionPresetSchema.index({ createdAt: -1 });
exports.ActionPresetSchema.index({ type: 1, category: 1 });
exports.ActionPresetSchema.index({ isArchived: 1, createdAt: -1 });
exports.ActionPresetSchema.index({ createdBy: 1, isArchived: 1 });
exports.ActionPresetSchema.index({ type: 1, isArchived: 1 });
exports.ActionPresetSchema.index({ category: 1, isArchived: 1 });
exports.ActionPresetSchema.index({ createdBy: 1, type: 1 });
exports.ActionPresetSchema.index({ type: 1, category: 1, isArchived: 1 });
exports.ActionPresetSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=action-preset.schema.js.map