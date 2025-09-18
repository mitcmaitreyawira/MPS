import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PointType, BadgeTier } from '../entities/point-log.entity';

export class QueryPointLogsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for description or category',
    example: 'mathematics',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by point type',
    enum: PointType,
    example: PointType.REWARD,
    required: false,
  })
  @IsOptional()
  @IsEnum(PointType)
  type?: PointType;

  @ApiProperty({
    description: 'Filter by student ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({
    description: 'Filter by category',
    example: 'Academic Achievement',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Filter by who added the points',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  addedBy?: string;

  @ApiProperty({
    description: 'Filter by badge tier',
    enum: BadgeTier,
    example: BadgeTier.GOLD,
    required: false,
  })
  @IsOptional()
  @IsEnum(BadgeTier)
  badgeTier?: BadgeTier;

  @ApiProperty({
    description: 'Filter by academic year',
    example: '2023-2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({
    description: 'Minimum points value',
    example: 0,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  minPoints?: number;

  @ApiProperty({
    description: 'Maximum points value',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  maxPoints?: number;

  @ApiProperty({
    description: 'Start date for filtering (ISO string)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO string)',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'timestamp',
    enum: ['timestamp', 'points', 'studentId', 'type'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}