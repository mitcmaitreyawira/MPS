import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActionPresetDocument = ActionPreset & Document;

export enum ActionType {
  REWARD = 'reward',
  VIOLATION = 'violation',
  MEDAL = 'medal',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

@Schema({ timestamps: true })
export class ActionPreset {
  @Prop({ required: true, enum: ActionType })
  type: ActionType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  points: number;

  @Prop({ enum: BadgeTier })
  badgeTier?: BadgeTier;

  @Prop({ trim: true })
  icon?: string;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  // Virtual fields for timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const ActionPresetSchema = SchemaFactory.createForClass(ActionPreset);

// Indexes for better query performance
ActionPresetSchema.index({ type: 1 });
ActionPresetSchema.index({ category: 1 });
ActionPresetSchema.index({ isArchived: 1 });
ActionPresetSchema.index({ createdBy: 1 });
ActionPresetSchema.index({ createdAt: -1 });

// Compound indexes for common queries
ActionPresetSchema.index({ type: 1, category: 1 });
ActionPresetSchema.index({ isArchived: 1, createdAt: -1 });
ActionPresetSchema.index({ createdBy: 1, isArchived: 1 });
ActionPresetSchema.index({ type: 1, isArchived: 1 });
ActionPresetSchema.index({ category: 1, isArchived: 1 });
ActionPresetSchema.index({ createdBy: 1, type: 1 });
ActionPresetSchema.index({ type: 1, category: 1, isArchived: 1 });

// Transform _id to id for frontend compatibility
ActionPresetSchema.set('toJSON', {
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});