import { ApiProperty } from '@nestjs/swagger';

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

export class Quest {
  @ApiProperty({
    description: 'Unique identifier for the quest',
    example: 'quest_123456789'
  })
  id!: string;

  @ApiProperty({
    description: 'Title of the quest',
    example: 'Community Service Project'
  })
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the quest',
    example: 'Help organize the school library for 2 hours'
  })
  description!: string;

  @ApiProperty({
    description: 'Points awarded for completing this quest',
    example: 50
  })
  points!: number;

  @ApiProperty({
    description: 'ID of the admin who created this quest',
    example: 'admin_123456789'
  })
  createdBy!: string;

  @ApiProperty({
    description: 'Timestamp when the quest was created',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Whether the quest is currently active',
    example: true
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'ID of the teacher supervising this quest',
    example: 'teacher_123456789'
  })
  supervisorId!: string;

  @ApiProperty({
    description: 'Required points to join this quest',
    example: 100
  })
  requiredPoints!: number;

  @ApiProperty({
    description: 'Badge tier awarded upon completion',
    enum: BadgeTier,
    required: false,
    example: BadgeTier.GOLD
  })
  badgeTier?: BadgeTier;

  @ApiProperty({
    description: 'Reason for the badge award',
    required: false,
    example: 'Outstanding community service'
  })
  badgeReason?: string;

  @ApiProperty({
    description: 'Icon for the badge',
    required: false,
    example: 'star'
  })
  badgeIcon?: string;

  @ApiProperty({
    description: 'Number of available slots for participants',
    required: false,
    example: 10
  })
  slotsAvailable?: number;

  @ApiProperty({
    description: 'Quest expiration date',
    required: false,
    example: '2024-12-31T23:59:59Z'
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Academic year for this quest',
    required: false,
    example: '2024-2025'
  })
  academicYear?: string;

  @ApiProperty({
    description: 'Number of participants in this quest',
    required: false,
    example: 5
  })
  participantCount?: number;

  @ApiProperty({
    description: 'Number of participants who completed this quest',
    required: false,
    example: 3
  })
  completionCount?: number;
}