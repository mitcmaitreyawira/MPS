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
exports.InitiateResetDto = exports.ResetPasswordDto = exports.GeneratePasswordDto = exports.ChangePasswordDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ChangePasswordDto {
    userId;
    newPassword;
    reason;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user whose password will be changed',
        example: '507f1f77bcf86cd799439011'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid user ID format' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New password for the user - any input is accepted',
        example: 'password'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for password change (optional)',
        required: false,
        example: 'User requested password reset due to security concerns'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Reason must not exceed 500 characters' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "reason", void 0);
class GeneratePasswordDto {
    length;
}
exports.GeneratePasswordDto = GeneratePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Length of generated password - any length is accepted',
        default: 16,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePasswordDto.prototype, "length", void 0);
class ResetPasswordDto {
    token;
    newPassword;
    userId;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password reset token',
        example: 'a1b2c3d4e5f6789012345678901234567890abcdef'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(32, { message: 'Invalid reset token format' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New password - any input is accepted',
        example: 'password'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID (optional, for additional verification)',
        required: false,
        example: '507f1f77bcf86cd799439011'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "userId", void 0);
class InitiateResetDto {
    userId;
    reason;
}
exports.InitiateResetDto = InitiateResetDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user to initiate password reset for',
        example: '507f1f77bcf86cd799439011'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid user ID format' }),
    __metadata("design:type", String)
], InitiateResetDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for initiating reset (optional)',
        required: false,
        example: 'User forgot password'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Reason must not exceed 500 characters' }),
    __metadata("design:type", String)
], InitiateResetDto.prototype, "reason", void 0);
//# sourceMappingURL=change-password.dto.js.map