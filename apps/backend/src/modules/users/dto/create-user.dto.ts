import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUrl,
  IsPhoneNumber,
  IsDateString,

  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsBoolean,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VALIDATION_MESSAGES,
  VALIDATION_PATTERNS,
  VALIDATION_LIMITS,
  ALLOWED_VALUES,
} from '../../../common/validation.constants';

export class CreateUserAddressDto {
  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Street address must not exceed 100 characters' })
  street?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'City must not exceed 50 characters' })
  city?: string;

  @ApiPropertyOptional({ description: 'State or province' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'State must not exceed 50 characters' })
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP or postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'ZIP code must not exceed 20 characters' })
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Country must not exceed 50 characters' })
  country?: string;
}

export class CreateUserSocialLinksDto {
  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  website?: string;

  @ApiPropertyOptional({ description: 'Twitter profile URL' })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  twitter?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  linkedin?: string;

  @ApiPropertyOptional({ description: 'GitHub profile URL' })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  github?: string;
}

export class CreateUserProfileDto {
  @ApiPropertyOptional({ description: 'User biography' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth (ISO string)' })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.DATE_INVALID })
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Gender', enum: ALLOWED_VALUES.GENDERS })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.GENDERS, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  gender?: string;

  @ApiPropertyOptional({ description: 'Subject taught by teacher (e.g., Math, Science)' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'User address', type: CreateUserAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserAddressDto)
  address?: CreateUserAddressDto;

  @ApiPropertyOptional({ description: 'Social media links', type: CreateUserSocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserSocialLinksDto)
  socialLinks?: CreateUserSocialLinksDto;
}



export class CreateUserPushNotificationsDto {
  @ApiPropertyOptional({ description: 'Push notifications enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Sound for push notifications', default: true })
  @IsOptional()
  @IsBoolean()
  sound?: boolean;

  @ApiPropertyOptional({ description: 'Vibration for push notifications', default: true })
  @IsOptional()
  @IsBoolean()
  vibration?: boolean;
}

export class CreateUserPreferencesDto {
  @ApiPropertyOptional({ description: 'UI theme preference', enum: ALLOWED_VALUES.THEMES, default: 'system' })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.THEMES, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  theme?: string;

  @ApiPropertyOptional({ description: 'Language preference', enum: ALLOWED_VALUES.LANGUAGES, default: 'en' })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.LANGUAGES, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  language?: string;

  @ApiPropertyOptional({ description: 'Timezone preference', enum: ALLOWED_VALUES.TIMEZONES, default: 'UTC' })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.TIMEZONES, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  timezone?: string;



  @ApiPropertyOptional({ description: 'Push notification preferences', type: CreateUserPushNotificationsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserPushNotificationsDto)
  pushNotifications?: CreateUserPushNotificationsDto;
}

export class CreateUserDto {
  @ApiPropertyOptional({ 
    description: 'Unique username for the user',
    example: 'john.doe'
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username?: string;

  @ApiProperty({ 
    description: 'User password - any input is accepted',
    example: 'password'
  })
  @IsString({ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  password!: string;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  @MinLength(VALIDATION_LIMITS.NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.FIRST_NAME_MIN_LENGTH })
  @MaxLength(VALIDATION_LIMITS.NAME_MAX_LENGTH, { message: VALIDATION_MESSAGES.FIRST_NAME_MAX_LENGTH })
  @Matches(VALIDATION_PATTERNS.NAME, { message: 'First name must contain only letters, spaces, hyphens, and apostrophes' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  @MinLength(VALIDATION_LIMITS.NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.LAST_NAME_MIN_LENGTH })
  @MaxLength(VALIDATION_LIMITS.NAME_MAX_LENGTH, { message: VALIDATION_MESSAGES.LAST_NAME_MAX_LENGTH })
  @Matches(VALIDATION_PATTERNS.NAME, { message: 'Last name must contain only letters, spaces, hyphens, and apostrophes' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  avatar?: string;

  @ApiPropertyOptional({ description: 'National student number (NISN)', example: '1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(32, { message: 'NISN must not exceed 32 characters' })
  nisn?: string;

  @ApiProperty({ description: 'User roles', enum: ALLOWED_VALUES.USER_ROLES, isArray: true })
  @IsArray()
  @IsEnum(ALLOWED_VALUES.USER_ROLES, { each: true, message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  roles!: string[];

  @ApiPropertyOptional({ description: 'Class ID for student/teacher assignment' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ description: 'User profile information', type: CreateUserProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  profile?: CreateUserProfileDto;

  @ApiPropertyOptional({ description: 'User preferences', type: CreateUserPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserPreferencesDto)
  preferences?: CreateUserPreferencesDto;
}