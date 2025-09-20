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
exports.RequestTimerSchema = exports.RequestTimer = exports.PerformanceMetricSchema = exports.PerformanceMetric = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let PerformanceMetric = class PerformanceMetric {
    metricType;
    operation;
    duration;
    timestamp;
    metadata;
    sessionId;
    correlationId;
    isError;
    errorMessage;
};
exports.PerformanceMetric = PerformanceMetric;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceMetric.prototype, "metricType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceMetric.prototype, "operation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PerformanceMetric.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], PerformanceMetric.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PerformanceMetric.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceMetric.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceMetric.prototype, "correlationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PerformanceMetric.prototype, "isError", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceMetric.prototype, "errorMessage", void 0);
exports.PerformanceMetric = PerformanceMetric = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PerformanceMetric);
exports.PerformanceMetricSchema = mongoose_1.SchemaFactory.createForClass(PerformanceMetric);
exports.PerformanceMetricSchema.index({ metricType: 1, timestamp: -1 });
exports.PerformanceMetricSchema.index({ operation: 1, timestamp: -1 });
exports.PerformanceMetricSchema.index({ timestamp: -1 });
exports.PerformanceMetricSchema.index({ isError: 1, timestamp: -1 });
exports.PerformanceMetricSchema.index({ 'metadata.userId': 1, timestamp: -1 });
let RequestTimer = class RequestTimer {
    timerId;
    operation;
    startTime;
    endTime;
    duration;
    status;
    metadata;
};
exports.RequestTimer = RequestTimer;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], RequestTimer.prototype, "timerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RequestTimer.prototype, "operation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], RequestTimer.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], RequestTimer.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], RequestTimer.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active' }),
    __metadata("design:type", String)
], RequestTimer.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], RequestTimer.prototype, "metadata", void 0);
exports.RequestTimer = RequestTimer = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RequestTimer);
exports.RequestTimerSchema = mongoose_1.SchemaFactory.createForClass(RequestTimer);
exports.RequestTimerSchema.index({ timerId: 1 }, { unique: true });
exports.RequestTimerSchema.index({ status: 1, startTime: -1 });
//# sourceMappingURL=performance-metric.schema.js.map