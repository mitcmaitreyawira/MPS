import { ApiProperty } from '@nestjs/swagger';

export enum PointType {
  REWARD = 'reward',
  VIOLATION = 'violation',
  QUEST = 'quest',
  APPEAL_REVERSAL = 'appeal_reversal',
  OVERRIDE = 'override',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

export interface Badge {
  id: string;
  tier: BadgeTier;
  reason: string;
  awardedBy: string;
  awardedOn: Date;
  icon?: string;
}

export class PointLog {
  @ApiProperty({
    description: 'Unique identifier for the point log',
    example: 'pointlog_123456789'
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the student receiving the points',
    example: 'student_123456789'
  })
  studentId!: string;

  @ApiProperty({
    description: 'Number of points (positive for rewards, negative for violations)',
    example: 10
  })
  points!: number;

  @ApiProperty({
    description: 'Type of point transaction',
    enum: PointType,
    example: PointType.REWARD
  })
  type!: PointType;

  @ApiProperty({
    description: 'Category of the point transaction',
    example: 'Academic Excellence'
  })
  category!: string;

  @ApiProperty({
    description: 'Description of why points were awarded/deducted',
    example: 'Excellent performance in mathematics quiz'
  })
  description!: string;

  @ApiProperty({
    description: 'Timestamp when the points were logged',
    example: '2024-01-15T10:30:00Z'
  })
  timestamp!: Date;

  @ApiProperty({
    description: 'ID of the user who added these points',
    example: 'teacher_123456789'
  })
  addedBy!: string;

  @ApiProperty({
    description: 'Badge awarded with these points',
    required: false,
    type: 'object'
  })
  badge?: Badge;

  @ApiProperty({
    description: 'Academic year for this point log',
    required: false,
    example: '2024-2025'
  })
  academicYear?: string;
}