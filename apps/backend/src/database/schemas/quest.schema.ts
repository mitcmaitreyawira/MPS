import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestDocument = Quest & Document;

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

@Schema({ timestamps: true })
export class Quest {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  points: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  supervisorId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  requiredPoints: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: BadgeTier })
  badgeTier?: BadgeTier;

  @Prop()
  badgeReason?: string;

  @Prop()
  badgeIcon?: string;

  @Prop({ min: 1 })
  slotsAvailable?: number;

  @Prop()
  expiresAt?: Date;

  @Prop()
  academicYear?: string;

  @Prop({ default: 0 })
  participantCount: number;

  @Prop({ default: 0 })
  completionCount: number;
}

export const QuestSchema = SchemaFactory.createForClass(Quest);

// Indexes for performance
QuestSchema.index({ supervisorId: 1 });
QuestSchema.index({ isActive: 1 });
QuestSchema.index({ createdAt: -1 });
QuestSchema.index({ expiresAt: 1 });
QuestSchema.index({ academicYear: 1 });
QuestSchema.index({ supervisorId: 1, isActive: 1 });
QuestSchema.index({ isActive: 1, expiresAt: 1 });
QuestSchema.index({ title: 'text', description: 'text' });

// Virtual for checking if quest is expired
QuestSchema.virtual('isExpired').get(function () {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

// Virtual for available slots
QuestSchema.virtual('availableSlots').get(function () {
  if (!this.slotsAvailable) return Infinity;
  return Math.max(0, this.slotsAvailable - this.participantCount);
});

// Pre-save middleware to set academic year if not provided
QuestSchema.pre('save', function (next) {
  if (!this.academicYear) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Academic year starts in August (month 7)
    const academicStartYear = month >= 7 ? year : year - 1;
    this.academicYear = `${academicStartYear}-${academicStartYear + 1}`;
  }
  next();
});