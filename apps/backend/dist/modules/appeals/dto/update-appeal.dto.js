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
exports.UpdateAppealDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const create_appeal_dto_1 = require("./create-appeal.dto");
const appeal_entity_1 = require("../entities/appeal.entity");
class UpdateAppealDto extends (0, swagger_1.PartialType)(create_appeal_dto_1.CreateAppealDto) {
    status;
    reviewedBy;
    reviewNotes;
}
exports.UpdateAppealDto = UpdateAppealDto;
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Status of the appeal',
        enum: appeal_entity_1.AppealStatus,
        example: appeal_entity_1.AppealStatus.APPROVED,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(appeal_entity_1.AppealStatus),
    __metadata("design:type", String)
], UpdateAppealDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'ID of the user who reviewed the appeal',
        example: '507f1f77bcf86cd799439013',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppealDto.prototype, "reviewedBy", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Review notes or response to the appeal',
        example: 'Appeal approved. Points have been restored.',
        maxLength: 1000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateAppealDto.prototype, "reviewNotes", void 0);
//# sourceMappingURL=update-appeal.dto.js.map