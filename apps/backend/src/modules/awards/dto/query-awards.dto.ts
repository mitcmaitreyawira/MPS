import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsMongoId, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AwardTier, AwardStatus } from '../entities/award.entity';

export class QueryAwardsDto {
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
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by recipient ID',
    example: '507f1f77bcf86cd799439012'
  })
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user who awarded',
    example: '507f1f77bcf86cd799439013'
  })
  @IsOptional()
  @IsMongoId()
  awardedBy?: string;

  @ApiPropertyOptional({
    enum: AwardTier,
    description: 'Filter by award tier',
    example: AwardTier.GOLD
  })
  @IsOptional()
  @IsEnum(AwardTier)
  tier?: AwardTier;

  @ApiPropertyOptional({
    enum: AwardStatus,
    description: 'Filter by award status',
    example: AwardStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(AwardStatus)
  status?: AwardStatus;

  @ApiPropertyOptional({
    description: 'Filter by academic year',
    example: '2023-2024'
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Search in award name and description',
    example: 'excellence'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter templates only',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'awardedOn',
    enum: ['name', 'tier', 'awardedOn', 'createdAt']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'awardedOn';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}