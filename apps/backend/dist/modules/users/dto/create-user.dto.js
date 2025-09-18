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
exports.CreateUserDto = exports.CreateUserPreferencesDto = exports.CreateUserPushNotificationsDto = exports.CreateUserProfileDto = exports.CreateUserSocialLinksDto = exports.CreateUserAddressDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const validation_constants_1 = require("../../../common/validation.constants");
class CreateUserAddressDto {
    street;
    city;
    state;
    zipCode;
    country;
}
exports.CreateUserAddressDto = CreateUserAddressDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Street address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Street address must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateUserAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'City' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'City must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'State or province' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'State must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ZIP or postal code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20, { message: 'ZIP code must not exceed 20 characters' }),
    __metadata("design:type", String)
], CreateUserAddressDto.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Country' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Country must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserAddressDto.prototype, "country", void 0);
class CreateUserSocialLinksDto {
    website;
    twitter;
    linkedin;
    github;
}
exports.CreateUserSocialLinksDto = CreateUserSocialLinksDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Website URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], CreateUserSocialLinksDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Twitter profile URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], CreateUserSocialLinksDto.prototype, "twitter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LinkedIn profile URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], CreateUserSocialLinksDto.prototype, "linkedin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'GitHub profile URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], CreateUserSocialLinksDto.prototype, "github", void 0);
class CreateUserProfileDto {
    bio;
    phone;
    dateOfBirth;
    gender;
    subject;
    address;
    socialLinks;
}
exports.CreateUserProfileDto = CreateUserProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User biography' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date of birth (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: validation_constants_1.VALIDATION_MESSAGES.DATE_INVALID }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender', enum: validation_constants_1.ALLOWED_VALUES.GENDERS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.GENDERS, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subject taught by teacher (e.g., Math, Science)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserProfileDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User address', type: CreateUserAddressDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateUserAddressDto),
    __metadata("design:type", CreateUserAddressDto)
], CreateUserProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Social media links', type: CreateUserSocialLinksDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateUserSocialLinksDto),
    __metadata("design:type", CreateUserSocialLinksDto)
], CreateUserProfileDto.prototype, "socialLinks", void 0);
class CreateUserPushNotificationsDto {
    enabled;
    sound;
    vibration;
}
exports.CreateUserPushNotificationsDto = CreateUserPushNotificationsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Push notifications enabled', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserPushNotificationsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sound for push notifications', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserPushNotificationsDto.prototype, "sound", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vibration for push notifications', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserPushNotificationsDto.prototype, "vibration", void 0);
class CreateUserPreferencesDto {
    theme;
    language;
    timezone;
    pushNotifications;
}
exports.CreateUserPreferencesDto = CreateUserPreferencesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UI theme preference', enum: validation_constants_1.ALLOWED_VALUES.THEMES, default: 'system' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.THEMES, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], CreateUserPreferencesDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Language preference', enum: validation_constants_1.ALLOWED_VALUES.LANGUAGES, default: 'en' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.LANGUAGES, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], CreateUserPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timezone preference', enum: validation_constants_1.ALLOWED_VALUES.TIMEZONES, default: 'UTC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.TIMEZONES, { message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", String)
], CreateUserPreferencesDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Push notification preferences', type: CreateUserPushNotificationsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateUserPushNotificationsDto),
    __metadata("design:type", CreateUserPushNotificationsDto)
], CreateUserPreferencesDto.prototype, "pushNotifications", void 0);
class CreateUserDto {
    username;
    password;
    firstName;
    lastName;
    avatar;
    nisn;
    roles;
    classId;
    profile;
    preferences;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Unique username for the user',
        example: 'john.doe'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Username must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Username must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password - any input is accepted',
        example: 'password'
    }),
    (0, class_validator_1.IsString)({ message: validation_constants_1.VALIDATION_MESSAGES.PASSWORD_REQUIRED }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User first name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(validation_constants_1.VALIDATION_LIMITS.NAME_MIN_LENGTH, { message: validation_constants_1.VALIDATION_MESSAGES.FIRST_NAME_MIN_LENGTH }),
    (0, class_validator_1.MaxLength)(validation_constants_1.VALIDATION_LIMITS.NAME_MAX_LENGTH, { message: validation_constants_1.VALIDATION_MESSAGES.FIRST_NAME_MAX_LENGTH }),
    (0, class_validator_1.Matches)(validation_constants_1.VALIDATION_PATTERNS.NAME, { message: 'First name must contain only letters, spaces, hyphens, and apostrophes' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User last name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(validation_constants_1.VALIDATION_LIMITS.NAME_MIN_LENGTH, { message: validation_constants_1.VALIDATION_MESSAGES.LAST_NAME_MIN_LENGTH }),
    (0, class_validator_1.MaxLength)(validation_constants_1.VALIDATION_LIMITS.NAME_MAX_LENGTH, { message: validation_constants_1.VALIDATION_MESSAGES.LAST_NAME_MAX_LENGTH }),
    (0, class_validator_1.Matches)(validation_constants_1.VALIDATION_PATTERNS.NAME, { message: 'Last name must contain only letters, spaces, hyphens, and apostrophes' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Avatar URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: validation_constants_1.VALIDATION_MESSAGES.URL_INVALID }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'National student number (NISN)', example: '1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32, { message: 'NISN must not exceed 32 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nisn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User roles', enum: validation_constants_1.ALLOWED_VALUES.USER_ROLES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(validation_constants_1.ALLOWED_VALUES.USER_ROLES, { each: true, message: validation_constants_1.VALIDATION_MESSAGES.INVALID_ENUM_VALUE }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Class ID for student/teacher assignment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User profile information', type: CreateUserProfileDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateUserProfileDto),
    __metadata("design:type", CreateUserProfileDto)
], CreateUserDto.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User preferences', type: CreateUserPreferencesDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateUserPreferencesDto),
    __metadata("design:type", CreateUserPreferencesDto)
], CreateUserDto.prototype, "preferences", void 0);
//# sourceMappingURL=create-user.dto.js.map