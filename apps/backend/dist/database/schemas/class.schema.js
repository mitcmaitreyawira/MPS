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
exports.ClassSchema = exports.Class = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Class = class Class {
    _id;
    name;
    headTeacherId;
    students;
    createdAt;
    updatedAt;
};
exports.Class = Class;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the class' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Class.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class name', example: 'Grade 10A' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Class.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Head teacher ID', required: false }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Class.prototype, "headTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of student IDs in this class', required: false }),
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], Class.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], Class.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], Class.prototype, "updatedAt", void 0);
exports.Class = Class = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'classes',
    })
], Class);
exports.ClassSchema = mongoose_1.SchemaFactory.createForClass(Class);
exports.ClassSchema.index({ name: 1 });
exports.ClassSchema.index({ headTeacherId: 1 });
exports.ClassSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=class.schema.js.map