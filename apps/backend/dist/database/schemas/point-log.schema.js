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
exports.PointLogSchema = exports.PointLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const point_log_entity_1 = require("../../modules/points/entities/point-log.entity");
let PointLog = class PointLog {
    studentId;
    points;
    type;
    category;
    description;
    timestamp;
    addedBy;
    badge;
    academicYear;
};
exports.PointLog = PointLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", String)
], PointLog.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], PointLog.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, enum: Object.values(point_log_entity_1.PointType) }),
    __metadata("design:type", String)
], PointLog.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], PointLog.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], PointLog.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], PointLog.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", String)
], PointLog.prototype, "addedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            id: String,
            tier: { type: String, enum: Object.values(point_log_entity_1.BadgeTier) },
            reason: String,
            awardedBy: String,
            awardedOn: Date,
            icon: String
        },
        required: false
    }),
    __metadata("design:type", Object)
], PointLog.prototype, "badge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], PointLog.prototype, "academicYear", void 0);
exports.PointLog = PointLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PointLog);
exports.PointLogSchema = mongoose_1.SchemaFactory.createForClass(PointLog);
exports.PointLogSchema.index({ studentId: 1 });
exports.PointLogSchema.index({ timestamp: -1 });
exports.PointLogSchema.index({ type: 1 });
exports.PointLogSchema.index({ category: 1 });
exports.PointLogSchema.index({ addedBy: 1 });
exports.PointLogSchema.index({ academicYear: 1 });
exports.PointLogSchema.index({ studentId: 1, timestamp: -1 });
//# sourceMappingURL=point-log.schema.js.map