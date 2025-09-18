import { ApiProperty } from '@nestjs/swagger';

export class AuditLog {
  @ApiProperty({
    description: 'Unique identifier for the audit log',
    example: 'log_123456789'
  })
  id!: string;

  @ApiProperty({
    description: 'The action that was performed',
    example: 'CREATE_CLASS'
  })
  action!: string;

  @ApiProperty({
    description: 'ID of the user who performed the action',
    example: 'user_123456789'
  })
  userId!: string;

  @ApiProperty({
    description: 'Username of the user who performed the action',
    example: 'john.doe@example.com'
  })
  userName!: string;

  @ApiProperty({
    description: 'Additional details about the action',
    example: { className: 'Math 101', teacherId: 'teacher123' }
  })
  details!: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the action was performed',
    example: '2024-01-15T10:30:00Z'
  })
  timestamp!: Date;
}