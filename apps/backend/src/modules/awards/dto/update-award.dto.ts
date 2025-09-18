import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, MaxLength } from 'class-validator';
import { AwardTier, AwardStatus } from '../entities/award.entity';

export class UpdateAwardDto {
  @ApiPropertyOptional({
    description: 'Award name',
    example: 'Outstanding Achievement'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Award description',
    example: 'Awarded for exceptional performance in academics'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: AwardTier,
    description: 'Award tier',
    example: AwardTier.GOLD
  })
  @IsOptional()
  @IsEnum(AwardTier)
  tier?: AwardTier;

  @ApiPropertyOptional({
    enum: AwardStatus,
    description: 'Award status',
    example: AwardStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(AwardStatus)
  status?: AwardStatus;

  @ApiPropertyOptional({
    description: 'Reason for the award',
    example: 'Excellent performance in mathematics competition'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Award icon',
    example: 'trophy'
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Academic year',
    example: '2023-2024'
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: 'object'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether this is a template',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'Template name if this is a template',
    example: 'Academic Excellence Template'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateName?: string;
}