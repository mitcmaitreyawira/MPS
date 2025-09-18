import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_VALUES } from '../../../common/validation.constants';

export class QueryUsersDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by user role', enum: ALLOWED_VALUES.USER_ROLES })
  @IsOptional()
  @IsEnum(ALLOWED_VALUES.USER_ROLES, { message: 'Invalid role provided' })
  role?: string;

  @ApiPropertyOptional({ description: 'Filter users by class ID' })
  @IsOptional()
  @IsString()
  classId?: string;



  @ApiPropertyOptional({ description: 'Sort field', enum: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'lastLoginAt', 'nisn', 'username'] })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'lastLoginAt', 'nisn', 'username'], {
    message: 'Invalid sort field'
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter users created after this date (ISO string)' })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter users created before this date (ISO string)' })
  @IsOptional()
  @IsString()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Filter users who logged in after this date (ISO string)' })
  @IsOptional()
  @IsString()
  lastLoginAfter?: string;

  @ApiPropertyOptional({ description: 'Filter users who logged in before this date (ISO string)' })
  @IsOptional()
  @IsString()
  lastLoginBefore?: string;

  @ApiPropertyOptional({ description: 'Include user profile information', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includeProfile?: boolean = false;

  @ApiPropertyOptional({ description: 'Include user preferences', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includePreferences?: boolean = false;

  @ApiPropertyOptional({ description: 'Include archived users in results', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includeArchived?: boolean = false;
}