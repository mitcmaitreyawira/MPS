import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BadgeTier } from '../entities/quest.entity';

export class CreateQuestDto {
  @ApiProperty({
    description: 'Title of the quest',
    example: 'Community Service Project',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @MinLength(3, { message: 'Quest title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Quest title must not exceed 100 characters' })
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the quest',
    example: 'Help organize the school library for 2 hours',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10, { message: 'Quest description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Quest description must not exceed 500 characters' })
  description!: string;

  @ApiProperty({
    description: 'Points awarded for completing this quest',
    example: 50,
    minimum: 1,
    maximum: 1000
  })
  @IsNumber({}, { message: 'Points must be a valid number' })
  @Min(1, { message: 'Points must be at least 1' })
  @Max(100, { message: 'Points must not exceed 100' })
  points!: number;

  @ApiProperty({
    description: 'ID of the teacher supervising this quest',
    example: 'teacher_123456789'
  })
  @IsString()
  supervisorId!: string;

  @ApiProperty({
    description: 'Required points to join this quest',
    example: 100,
    minimum: 0,
    maximum: 10000
  })
  @IsNumber({}, { message: 'Required points must be a valid number' })
  @Min(0, { message: 'Required points must be at least 0' })
  @Max(100, { message: 'Required points must not exceed 100' })
  requiredPoints!: number;

  @ApiPropertyOptional({
    description: 'Badge tier awarded upon completion',
    enum: BadgeTier,
    example: BadgeTier.GOLD
  })
  @IsOptional()
  @IsEnum(BadgeTier, { message: 'Badge tier must be bronze, silver, or gold' })
  badgeTier?: BadgeTier;

  @ApiPropertyOptional({
    description: 'Reason for the badge award',
    example: 'Outstanding community service',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Badge reason must not exceed 200 characters' })
  badgeReason?: string;

  @ApiPropertyOptional({
    description: 'Icon for the badge',
    example: 'star',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Badge icon must not exceed 50 characters' })
  badgeIcon?: string;

  @ApiPropertyOptional({
    description: 'Number of available slots for participants',
    example: 10,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber({}, { message: 'Slots available must be a valid number' })
  @Min(1, { message: 'Slots available must be at least 1' })
  @Max(1000, { message: 'Slots available must not exceed 1000' })
  slotsAvailable?: number;

  @ApiPropertyOptional({
    description: 'Quest expiration date (ISO string)',
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid ISO date string' })
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Academic year for this quest',
    example: '2024-2025',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Academic year must not exceed 20 characters' })
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Whether the quest is currently active',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}