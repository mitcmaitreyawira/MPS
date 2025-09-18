import { ApiProperty } from '@nestjs/swagger';

export enum AppealStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class Appeal {
  @ApiProperty({
    description: 'Unique identifier for the appeal',
    example: 'appeal_123456789'
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the point log being appealed',
    example: 'pointlog_123456789'
  })
  pointLogId!: string;

  @ApiProperty({
    description: 'ID of the student making the appeal',
    example: 'student_123456789'
  })
  studentId!: string;

  @ApiProperty({
    description: 'Reason for the appeal',
    example: 'I was not present during the incident'
  })
  reason!: string;

  @ApiProperty({
    description: 'Current status of the appeal',
    enum: AppealStatus,
    example: AppealStatus.PENDING
  })
  status!: AppealStatus;

  @ApiProperty({
    description: 'Timestamp when the appeal was submitted',
    example: '2024-01-15T10:30:00Z'
  })
  submittedAt!: Date;

  @ApiProperty({
    description: 'ID of the admin/teacher who reviewed the appeal',
    required: false,
    example: 'admin_123456789'
  })
  reviewedBy?: string;

  @ApiProperty({
    description: 'Timestamp when the appeal was reviewed',
    required: false,
    example: '2024-01-16T14:20:00Z'
  })
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Review notes or response to the appeal',
    required: false,
    example: 'Appeal approved. Points have been restored.'
  })
  reviewNotes?: string;

  @ApiProperty({
    description: 'Academic year for this appeal',
    required: false,
    example: '2024-2025'
  })
  academicYear?: string;
}