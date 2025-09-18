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
exports.AppealSchema = exports.Appeal = exports.AppealStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var AppealStatus;
(function (AppealStatus) {
    AppealStatus["PENDING"] = "pending";
    AppealStatus["APPROVED"] = "approved";
    AppealStatus["REJECTED"] = "rejected";
})(AppealStatus || (exports.AppealStatus = AppealStatus = {}));
let Appeal = class Appeal {
    id;
    pointLogId;
    studentId;
    reason;
    status;
    submittedAt;
    reviewedBy;
    reviewedAt;
    reviewNotes;
    academicYear;
};
exports.Appeal = Appeal;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Appeal.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Appeal.prototype, "pointLogId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Appeal.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, maxlength: 1000 }),
    __metadata("design:type", String)
], Appeal.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(AppealStatus),
        default: AppealStatus.PENDING,
        index: true
    }),
    __metadata("design:type", String)
], Appeal.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, index: true }),
    __metadata("design:type", Date)
], Appeal.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, index: true }),
    __metadata("design:type", String)
], Appeal.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Appeal.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, maxlength: 1000 }),
    __metadata("design:type", String)
], Appeal.prototype, "reviewNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Appeal.prototype, "academicYear", void 0);
exports.Appeal = Appeal = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'appeals',
    })
], Appeal);
exports.AppealSchema = mongoose_1.SchemaFactory.createForClass(Appeal);
exports.AppealSchema.index({ studentId: 1, academicYear: 1 });
exports.AppealSchema.index({ status: 1, submittedAt: -1 });
exports.AppealSchema.index({ reviewedBy: 1, reviewedAt: -1 });
exports.AppealSchema.index({ academicYear: 1, status: 1 });
exports.AppealSchema.index({ reason: 'text', reviewNotes: 'text' });
//# sourceMappingURL=appeal.schema.js.map