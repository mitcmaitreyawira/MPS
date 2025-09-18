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
exports.SyncOperationSchema = exports.SyncOperation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let SyncOperation = class SyncOperation {
    operationId;
    type;
    entity;
    data;
    status;
    retries;
    error;
    timestamp;
    lastProcessed;
    completedAt;
    maxRetries;
    metadata;
};
exports.SyncOperation = SyncOperation;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], SyncOperation.prototype, "operationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['create', 'update', 'delete', 'reconcile'] }),
    __metadata("design:type", String)
], SyncOperation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SyncOperation.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], SyncOperation.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['pending', 'processing', 'completed', 'failed'] }),
    __metadata("design:type", String)
], SyncOperation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], SyncOperation.prototype, "retries", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SyncOperation.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], SyncOperation.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], SyncOperation.prototype, "lastProcessed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], SyncOperation.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], SyncOperation.prototype, "maxRetries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], SyncOperation.prototype, "metadata", void 0);
exports.SyncOperation = SyncOperation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SyncOperation);
exports.SyncOperationSchema = mongoose_1.SchemaFactory.createForClass(SyncOperation);
exports.SyncOperationSchema.index({ status: 1, timestamp: 1 });
exports.SyncOperationSchema.index({ operationId: 1 }, { unique: true });
exports.SyncOperationSchema.index({ entity: 1, type: 1 });
exports.SyncOperationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
//# sourceMappingURL=sync-operation.schema.js.map