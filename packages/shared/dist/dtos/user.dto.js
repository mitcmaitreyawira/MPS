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
exports.UpdateUserPreferencesDto = exports.UpdateUserProfileDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateUserDto {
    email;
    firstName;
    lastName;
    password;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
class UpdateUserDto {
    firstName;
    lastName;
    avatar;
    profile;
    preferences;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => UpdateUserProfileDto),
    __metadata("design:type", UpdateUserProfileDto)
], UpdateUserDto.prototype, "profile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => UpdateUserPreferencesDto),
    __metadata("design:type", UpdateUserPreferencesDto)
], UpdateUserDto.prototype, "preferences", void 0);
class UpdateUserProfileDto {
    bio;
    phone;
    dateOfBirth;
    gender;
    address;
    socialLinks;
}
exports.UpdateUserProfileDto = UpdateUserProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['male', 'female', 'other', 'prefer-not-to-say']),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateUserProfileDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateUserProfileDto.prototype, "socialLinks", void 0);
class UpdateUserPreferencesDto {
    theme;
    language;
    timezone;
    emailNotifications;
    pushNotifications;
}
exports.UpdateUserPreferencesDto = UpdateUserPreferencesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['light', 'dark', 'system']),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateUserPreferencesDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateUserPreferencesDto.prototype, "pushNotifications", void 0);
//# sourceMappingURL=user.dto.js.map