import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '../entities/teacher-report.entity';

export class QueryTeacherReportsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for report details',
    example: 'late to class',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by report status',
    enum: ReportStatus,
    example: ReportStatus.NEW,
    required: false
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiProperty({
    description: 'Filter by submitter user ID',
    example: 'user_123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  submittedByUserId?: string;

  @ApiProperty({
    description: 'Filter by target teacher ID',
    example: 'teacher_123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  targetTeacherId?: string;

  @ApiProperty({
    description: 'Filter by anonymous reports only',
    example: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({
    description: 'Filter by academic year',
    example: '2024-2025',
    required: false
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'timestamp',
    required: false,
    enum: ['timestamp', 'status', 'targetTeacherId']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    required: false,
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}