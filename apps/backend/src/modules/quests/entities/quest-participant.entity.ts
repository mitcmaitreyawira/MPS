import { ApiProperty } from '@nestjs/swagger';

export enum QuestCompletionStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED_FOR_REVIEW = 'submitted_for_review',
  COMPLETED = 'completed',
}

export class QuestParticipant {
  @ApiProperty({
    description: 'ID of the quest',
    example: 'quest_123456789'
  })
  questId!: string;

  @ApiProperty({
    description: 'ID of the student participant',
    example: 'student_123456789'
  })
  studentId!: string;

  @ApiProperty({
    description: 'Timestamp when the student joined the quest',
    example: '2024-01-15T10:30:00Z'
  })
  joinedAt!: Date;

  @ApiProperty({
    description: 'Current status of quest completion',
    enum: QuestCompletionStatus,
    example: QuestCompletionStatus.IN_PROGRESS
  })
  status!: QuestCompletionStatus;

  @ApiProperty({
    description: 'Timestamp when the quest was submitted for review',
    required: false,
    example: '2024-01-20T15:45:00Z'
  })
  submittedAt?: Date;

  @ApiProperty({
    description: 'Timestamp when the quest was completed',
    required: false,
    example: '2024-01-22T09:15:00Z'
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Review notes from the supervisor',
    required: false,
    example: 'Excellent work on organizing the library'
  })
  reviewNotes?: string;

  @ApiProperty({
    description: 'Academic year for this participation',
    required: false,
    example: '2024-2025'
  })
  academicYear?: string;
}