import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AwardDocument = Award & Document;

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

@Schema({ timestamps: true })
export class Award {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, required: true, enum: Object.values(AwardTier) })
  tier: AwardTier;

  @Prop({ type: String, required: true, enum: Object.values(AwardStatus), default: AwardStatus.ACTIVE })
  status: AwardStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  recipientId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  awardedBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  awardedOn: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, required: false })
  icon?: string;

  @Prop({ type: String, required: false })
  academicYear?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({ type: String, required: false })
  templateName?: string;

  @Prop({ type: Number, required: false })
  pointValue?: number;
}

export const AwardSchema = SchemaFactory.createForClass(Award);

// Indexes for better query performance
AwardSchema.index({ recipientId: 1 });
AwardSchema.index({ awardedBy: 1 });
AwardSchema.index({ tier: 1 });
AwardSchema.index({ status: 1 });
AwardSchema.index({ awardedOn: -1 });
AwardSchema.index({ academicYear: 1 });
AwardSchema.index({ isTemplate: 1 });
AwardSchema.index({ recipientId: 1, awardedOn: -1 });
AwardSchema.index({ tier: 1, status: 1 });