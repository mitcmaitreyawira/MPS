import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AppealStatus } from '../entities/appeal.entity';

export class QueryAppealsDto {
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
    description: 'Search term for appeal reason',
    example: 'unfair',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by appeal status',
    enum: AppealStatus,
    example: AppealStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppealStatus)
  status?: AppealStatus;

  @ApiProperty({
    description: 'Filter by student ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({
    description: 'Filter by reviewer ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @ApiProperty({
    description: 'Filter by academic year',
    example: '2023-2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'submittedAt',
    enum: ['submittedAt', 'reviewedAt', 'status'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'submittedAt';

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