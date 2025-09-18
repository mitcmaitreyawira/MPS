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
exports.UpdateUserDto = exports.UpdateUserPreferencesDto = exports.UpdateUserPushNotificationsDto = exports.UpdateUserProfileDto = exports.UpdateUserSocialLinksDto = exports.UpdateUserAddressDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const validation_constants_1 = require("../../../common/validation.constants");
class UpdateUserAddressDto {
    street;
    city;
    state;
    zipCode;
    country;
}
exports.UpdateUserAddressDto = UpdateUserAddressDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Street address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Street address must not exceed 100 characters' }),
    __metadata("design:type", String)
], UpdateUserAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'City' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'City must not exceed 50 characters' }),
    __metadata("design:type", String)
], UpdateUserAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'State or province' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'State must not exceed 50 characters' }),
    __metadata("design:type", String)
], UpdateUserAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ZIP or postal code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20, { message: 'ZIP code must not exceed 20 characters' }),
    __metadata("design:type", String)
], UpdateUserAddressDto.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Country' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Country must not exceed 50 characters' }),
    __metadata("design:type", String)
], UpdateUserAddressDto.prototype, "country", void 0);
class UpdateUserSocialLinksDto {
    website;
    twitter;
    linkedin;
    github;
}
exports.UpdateUserSocialLinksDto = UpdateUserSocialLinksDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Website URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], UpdateUserSocialLinksDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Twitter profile URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], UpdateUserSocialLinksDto.prototype, "twitter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LinkedIn profile URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], UpdateUserSocialLinksDto.prototype, "linkedin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'GitHub profile URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], UpdateUserSocialLinksDto.prototype, "github", void 0);
class UpdateUserProfileDto {
    bio;
    phone;
    dateOfBirth;
    gender;
    subject;
    address;
    socialLinks;
}
exports.UpdateUserProfileDto = UpdateUserProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User biography' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date of birth (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: validation_constants_1.VALIDATION_MESSAGES.DATE_INVALID }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender', enum: validation_constants_1.ALLOWED_VALUES.GENDERS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.GENDERS, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subject taught by teacher (e.g., Math, Science)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User address', type: UpdateUserAddressDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateUserAddressDto),
    __metadata("design:type", UpdateUserAddressDto)
], UpdateUserProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Social media links', type: UpdateUserSocialLinksDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateUserSocialLinksDto),
    __metadata("design:type", UpdateUserSocialLinksDto)
], UpdateUserProfileDto.prototype, "socialLinks", void 0);
class UpdateUserPushNotificationsDto {
    enabled;
    sound;
    vibration;
}
exports.UpdateUserPushNotificationsDto = UpdateUserPushNotificationsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Push notifications enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPushNotificationsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sound for push notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPushNotificationsDto.prototype, "sound", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vibration for push notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPushNotificationsDto.prototype, "vibration", void 0);
class UpdateUserPreferencesDto {
    theme;
    language;
    timezone;
    pushNotifications;
}
exports.UpdateUserPreferencesDto = UpdateUserPreferencesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UI theme preference', enum: validation_constants_1.ALLOWED_VALUES.THEMES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.THEMES, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Language preference', enum: validation_constants_1.ALLOWED_VALUES.LANGUAGES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.LANGUAGES, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timezone preference', enum: validation_constants_1.ALLOWED_VALUES.TIMEZONES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.TIMEZONES, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Push notification preferences', type: UpdateUserPushNotificationsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateUserPushNotificationsDto),
    __metadata("design:type", UpdateUserPushNotificationsDto)
], UpdateUserPreferencesDto.prototype, "pushNotifications", void 0);
class UpdateUserDto {
    name;
    points;
    firstName;
    lastName;
    avatar;
    roles;
    classId;
    profile;
    preferences;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User full name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must not exceed 100 characters' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User points for achievements and activities' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Points must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Points cannot be negative' }),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User first name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User last name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Avatar URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User roles', enum: validation_constants_1.ALLOWED_VALUES.USER_ROLES, isArray: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.USER_ROLES, { each: true, message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Class ID for student assignment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User profile information', type: UpdateUserProfileDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateUserProfileDto),
    __metadata("design:type", UpdateUserProfileDto)
], UpdateUserDto.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User preferences', type: UpdateUserPreferencesDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateUserPreferencesDto),
    __metadata("design:type", UpdateUserPreferencesDto)
], UpdateUserDto.prototype, "preferences", void 0);
//# sourceMappingURL=update-user.dto.js.map