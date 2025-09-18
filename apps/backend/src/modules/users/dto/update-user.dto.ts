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
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  VALIDATION_MESSAGES,
  VALIDATION_PATTERNS,
  VALIDATION_LIMITS,
  ALLOWED_VALUES,
} from '../../../common/validation.constants';

export class UpdateUserAddressDto {
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

export class UpdateUserSocialLinksDto {
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

export class UpdateUserProfileDto {
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

  @ApiPropertyOptional({ description: 'User address', type: UpdateUserAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserAddressDto)
  address?: UpdateUserAddressDto;

  @ApiPropertyOptional({ description: 'Social media links', type: UpdateUserSocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserSocialLinksDto)
  socialLinks?: UpdateUserSocialLinksDto;
}



export class UpdateUserPushNotificationsDto {
  @ApiPropertyOptional({ description: 'Push notifications enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Sound for push notifications' })
  @IsOptional()
  @IsBoolean()
  sound?: boolean;

  @ApiPropertyOptional({ description: 'Vibration for push notifications' })
  @IsOptional()
  @IsBoolean()
  vibration?: boolean;
}

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({ description: 'UI theme preference', enum: ALLOWED_VALUES.THEMES })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.THEMES, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  theme?: string;

  @ApiPropertyOptional({ description: 'Language preference', enum: ALLOWED_VALUES.LANGUAGES })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.LANGUAGES, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  language?: string;

  @ApiPropertyOptional({ description: 'Timezone preference', enum: ALLOWED_VALUES.TIMEZONES })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.TIMEZONES, { message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  timezone?: string;



  @ApiPropertyOptional({ description: 'Push notification preferences', type: UpdateUserPushNotificationsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserPushNotificationsDto)
  pushNotifications?: UpdateUserPushNotificationsDto;
}

export class UpdateUserDto {

  @ApiPropertyOptional({ description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'User points for achievements and activities' })
  @IsOptional()
  @IsNumber({}, { message: 'Points must be a valid number' })
  @Min(0, { message: 'Points cannot be negative' })
  points?: number;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  avatar?: string;

  @ApiPropertyOptional({ description: 'User roles', enum: ALLOWED_VALUES.USER_ROLES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ALLOWED_VALUES.USER_ROLES, { each: true, message: VALIDATION_MESSAGES.INVALID_ENUM_VALUE })
  roles?: string[];

  @ApiPropertyOptional({ description: 'Class ID for student assignment' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ description: 'User profile information', type: UpdateUserProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserProfileDto)
  profile?: UpdateUserProfileDto;

  @ApiPropertyOptional({ description: 'User preferences', type: UpdateUserPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserPreferencesDto)
  preferences?: UpdateUserPreferencesDto;
}