import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherReportDto {
  @ApiProperty({
    description: 'ID of the user who submitted the report (automatically set from authenticated user)',
    example: 'user_123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  submittedByUserId?: string;

  @ApiProperty({
    description: 'Whether the report was submitted anonymously',
    example: false
  })
  @IsBoolean()
  isAnonymous!: boolean;

  @ApiProperty({
    description: 'ID of the teacher being reported',
    example: 'teacher_123456789'
  })
  @IsString()
  @IsNotEmpty()
  targetTeacherId!: string;

  @ApiProperty({
    description: 'Details of the report',
    example: 'Teacher was consistently late to class and unprepared'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  details!: string;

  @ApiProperty({
    description: 'Academic year for this report',
    example: '2024-2025',
    required: false
  })
  @IsOptional()
  @IsString()
  academicYear?: string;
}