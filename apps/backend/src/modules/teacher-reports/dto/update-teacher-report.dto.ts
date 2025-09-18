import { PartialType } from '@nestjs/swagger';
import { CreateTeacherReportDto } from './create-teacher-report.dto';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '../entities/teacher-report.entity';

export class UpdateTeacherReportDto extends PartialType(CreateTeacherReportDto) {
  @ApiProperty({
    description: 'Status of the report',
    enum: ReportStatus,
    example: ReportStatus.REVIEWED,
    required: false
  })
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({
    description: 'Response from administration',
    example: 'We have reviewed your report and will take appropriate action.',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  response?: string;

  @ApiProperty({
    description: 'ID of the user who reviewed the report',
    example: 'admin_123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  reviewedByUserId?: string;
}