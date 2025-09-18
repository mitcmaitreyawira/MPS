import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppealDto {
  @ApiProperty({
    description: 'ID of the point log being appealed',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  pointLogId: string;

  @ApiProperty({
    description: 'ID of the student submitting the appeal',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Reason for the appeal',
    example: 'I believe the points were deducted unfairly as I was not present during the incident.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;

  @ApiProperty({
    description: 'Academic year for the appeal',
    example: '2023-2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  academicYear?: string;
}