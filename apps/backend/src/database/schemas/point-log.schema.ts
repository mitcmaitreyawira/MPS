import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PointType, BadgeTier } from '../../modules/points/entities/point-log.entity';

export type PointLogDocument = PointLog & Document;

@Schema({ timestamps: true })
export class PointLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: string;

  @Prop({ type: Number, required: true })
  points: number;

  @Prop({ type: String, required: true, enum: Object.values(PointType) })
  type: PointType;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  addedBy: string;

  @Prop({
    type: {
      id: String,
      tier: { type: String, enum: Object.values(BadgeTier) },
      reason: String,
      awardedBy: String,
      awardedOn: Date,
      icon: String
    },
    required: false
  })
  badge?: {
    id: string;
    tier: BadgeTier;
    reason: string;
    awardedBy: string;
    awardedOn: Date;
    icon?: string;
  };

  @Prop({ type: String, required: false })
  academicYear?: string;
}

export const PointLogSchema = SchemaFactory.createForClass(PointLog);

// Indexes for better query performance
PointLogSchema.index({ studentId: 1 });
PointLogSchema.index({ timestamp: -1 });
PointLogSchema.index({ type: 1 });
PointLogSchema.index({ category: 1 });
PointLogSchema.index({ addedBy: 1 });
PointLogSchema.index({ academicYear: 1 });
PointLogSchema.index({ studentId: 1, timestamp: -1 });