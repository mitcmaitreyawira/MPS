import { ApiProperty } from '@nestjs/swagger';

export enum AwardTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

export enum AwardStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export class Award {
  @ApiProperty({ description: 'Award ID' })
  id: string;

  @ApiProperty({ description: 'Award name' })
  name: string;

  @ApiProperty({ description: 'Award description' })
  description: string;

  @ApiProperty({ enum: AwardTier, description: 'Award tier' })
  tier: AwardTier;

  @ApiProperty({ enum: AwardStatus, description: 'Award status' })
  status: AwardStatus;

  @ApiProperty({ description: 'Recipient user ID' })
  recipientId: string;

  @ApiProperty({ description: 'Recipient name' })
  recipientName?: string;

  @ApiProperty({ description: 'User ID who awarded this' })
  awardedBy: string;

  @ApiProperty({ description: 'Name of user who awarded this' })
  awardedByName?: string;

  @ApiProperty({ description: 'Date when award was given' })
  awardedOn: Date;

  @ApiProperty({ description: 'Reason for the award' })
  reason: string;

  @ApiProperty({ description: 'Award icon', required: false })
  icon?: string;

  @ApiProperty({ description: 'Academic year', required: false })
  academicYear?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Whether this is a template', required: false })
  isTemplate?: boolean;

  @ApiProperty({ description: 'Template name if this is a template', required: false })
  templateName?: string;

  @ApiProperty({ description: 'Point value of the award', required: false })
  pointValue?: number;

  @ApiProperty({ description: 'Creation timestamp', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp', required: false })
  updatedAt?: Date;
}

export const AWARD_POINT_VALUES = {
  [AwardTier.GOLD]: 5,
  [AwardTier.SILVER]: 3,
  [AwardTier.BRONZE]: 1,
};