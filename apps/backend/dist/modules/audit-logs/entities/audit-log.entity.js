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
exports.AuditLog = void 0;
const swagger_1 = require("@nestjs/swagger");
class AuditLog {
    id;
    action;
    userId;
    userName;
    details;
    timestamp;
}
exports.AuditLog = AuditLog;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the audit log',
        example: 'log_123456789'
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The action that was performed',
        example: 'CREATE_CLASS'
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who performed the action',
        example: 'user_123456789'
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Username of the user who performed the action',
        example: 'john.doe@example.com'
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional details about the action',
        example: { className: 'Math 101', teacherId: 'teacher123' }
    }),
    __metadata("design:type", Object)
], AuditLog.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the action was performed',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
//# sourceMappingURL=audit-log.entity.js.map