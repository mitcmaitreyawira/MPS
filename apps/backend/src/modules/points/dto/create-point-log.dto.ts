import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PointType, Badge } from '../entities/point-log.entity';

export class CreatePointLogDto {
  @ApiProperty({
    description: 'ID of the student receiving/losing points',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Number of points (positive for earned, negative for deducted)',
    example: 10,
  })
  @IsNumber()
  points: number;

  @ApiProperty({
    description: 'Type of point transaction',
    enum: PointType,
    example: PointType.REWARD,
  })
  @IsEnum(PointType)
  type: PointType;

  @ApiProperty({
    description: 'Category of the point transaction',
    example: 'Academic Achievement',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Description of why points were awarded/deducted',
    example: 'Excellent performance in mathematics quiz',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'ID of the user who added these points',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  @IsNotEmpty()
  addedBy: string;

  @ApiProperty({
    description: 'Badge information if this point log includes a badge',
    required: false,
    type: 'object',
  })
  @IsOptional()
  badge?: Badge;

  @ApiProperty({
    description: 'Academic year for this point log',
    example: '2023-2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  academicYear?: string;
}