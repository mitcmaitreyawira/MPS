import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { ActionType, BadgeTier } from '../../../database/schemas/action-preset.schema';

export class CreateActionPresetDto {
  @ApiProperty({
    description: 'Type of action preset',
    enum: ActionType,
    example: ActionType.REWARD,
  })
  @IsEnum(ActionType)
  type: ActionType;

  @ApiProperty({
    description: 'Name of the action preset',
    example: 'Excellent Participation',
    maxLength: 100,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Category of the action preset',
    example: 'Academic Excellence',
    maxLength: 50,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  category: string;

  @ApiProperty({
    description: 'Description of the action preset',
    example: 'Awarded for outstanding participation in class discussions',
    maxLength: 500,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({
    description: 'Points awarded/deducted for this action',
    example: 10,
  })
  @IsNumber()
  points: number;

  @ApiPropertyOptional({
    description: 'Badge tier (only for MEDAL type)',
    enum: BadgeTier,
    example: BadgeTier.GOLD,
  })
  @IsOptional()
  @IsEnum(BadgeTier)
  badgeTier?: BadgeTier;

  @ApiPropertyOptional({
    description: 'Icon identifier (only for MEDAL type)',
    example: 'star',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  icon?: string;

  @ApiPropertyOptional({
    description: 'Whether the action preset is archived',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({
    description: 'ID of the user who created this action preset',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  createdBy: Types.ObjectId;
}