import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, IsMongoId, IsNotEmpty, MaxLength } from 'class-validator';
import { AwardTier } from '../entities/award.entity';

export class CreateAwardDto {
  @ApiProperty({
    description: 'Award name',
    example: 'Outstanding Achievement'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Award description',
    example: 'Awarded for exceptional performance in academics'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    enum: AwardTier,
    description: 'Award tier',
    example: AwardTier.GOLD
  })
  @IsEnum(AwardTier)
  tier: AwardTier;

  @ApiPropertyOptional({
    description: 'Recipient user ID (not required for templates)',
    example: '507f1f77bcf86cd799439012'
  })
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @ApiProperty({
    description: 'Reason for the award',
    example: 'Excellent performance in mathematics competition'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

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