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
exports.AuditLogSchema = exports.AuditLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_action_enum_1 = require("../../modules/auth/enums/audit-action.enum");
let AuditLog = class AuditLog {
    userId;
    action;
    resource;
    resourceId;
    data;
    timestamp;
    ipAddress;
    userAgent;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, enum: Object.values(audit_action_enum_1.AuditAction) }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resource", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AuditLog.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AuditLog);
exports.AuditLogSchema = mongoose_1.SchemaFactory.createForClass(AuditLog);
exports.AuditLogSchema.index({ userId: 1 });
exports.AuditLogSchema.index({ action: 1 });
exports.AuditLogSchema.index({ resource: 1, resourceId: 1 });
exports.AuditLogSchema.index({ timestamp: -1 });
exports.AuditLogSchema.index({ 'data.ipAddress': 1 });
//# sourceMappingURL=audit-log.schema.js.map