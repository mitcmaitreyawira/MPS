import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BadgeTier } from '../entities/quest.entity';

export class QueryQuestsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a valid number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a valid number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term for quest title or description',
    example: 'community service'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by supervisor ID',
    example: 'teacher_123456789'
  })
  @IsOptional()
  @IsString()
  supervisorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by badge tier',
    enum: BadgeTier,
    example: BadgeTier.GOLD
  })
  @IsOptional()
  @IsEnum(BadgeTier, { message: 'Badge tier must be bronze, silver, or gold' })
  badgeTier?: BadgeTier;

  @ApiPropertyOptional({
    description: 'Filter by academic year',
    example: '2024-2025'
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Minimum points required',
    example: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Min points must be a valid number' })
  @Min(0, { message: 'Min points must be at least 0' })
  minPoints?: number;

  @ApiPropertyOptional({
    description: 'Maximum points required',
    example: 500
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Max points must be a valid number' })
  @Min(0, { message: 'Max points must be at least 0' })
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['title', 'points', 'createdAt', 'expiresAt']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Include expired quests in results',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  includeExpired?: boolean;
}