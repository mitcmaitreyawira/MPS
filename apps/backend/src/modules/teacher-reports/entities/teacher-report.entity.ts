import { ApiProperty } from '@nestjs/swagger';

export enum ReportStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
}

export class TeacherReport {
  @ApiProperty({
    description: 'Unique identifier for the teacher report',
    example: 'report_123456789'
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the user who submitted the report',
    example: 'user_123456789'
  })
  submittedByUserId!: string;

  @ApiProperty({
    description: 'Whether the report was submitted anonymously',
    example: false
  })
  isAnonymous!: boolean;

  @ApiProperty({
    description: 'ID of the teacher being reported',
    example: 'teacher_123456789'
  })
  targetTeacherId!: string;

  @ApiProperty({
    description: 'Details of the report',
    example: 'Teacher was consistently late to class and unprepared'
  })
  details!: string;

  @ApiProperty({
    description: 'Timestamp when the report was submitted',
    example: '2024-01-15T10:30:00Z'
  })
  timestamp!: Date;

  @ApiProperty({
    description: 'Current status of the report',
    enum: ReportStatus,
    example: ReportStatus.NEW
  })
  status!: ReportStatus;

  @ApiProperty({
    description: 'Response from administration',
    required: false,
    example: 'We have reviewed your report and will take appropriate action.'
  })
  response?: string;

  @ApiProperty({
    description: 'ID of the user who reviewed the report',
    required: false,
    example: 'admin_123456789'
  })
  reviewedByUserId?: string;

  @ApiProperty({
    description: 'Timestamp when the report was reviewed',
    required: false,
    example: '2024-01-25T09:00:00Z'
  })
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Academic year for this report',
    required: false,
    example: '2024-2025'
  })
  academicYear?: string;
}