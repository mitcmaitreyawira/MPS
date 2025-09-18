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
exports.SubmitQuestDto = exports.JoinQuestDto = exports.ReviewQuestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ReviewQuestDto {
    studentId;
    isApproved;
    reviewNotes;
}
exports.ReviewQuestDto = ReviewQuestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the student whose quest submission is being reviewed',
        example: 'student123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReviewQuestDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the quest submission is approved',
        example: true
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReviewQuestDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional review notes from the supervisor',
        example: 'Great work on this quest!',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReviewQuestDto.prototype, "reviewNotes", void 0);
class JoinQuestDto {
}
exports.JoinQuestDto = JoinQuestDto;
class SubmitQuestDto {
}
exports.SubmitQuestDto = SubmitQuestDto;
//# sourceMappingURL=quest-participant.dto.js.map