import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppealDocument = Appeal & Document;

export enum AppealStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({
  timestamps: true,
  collection: 'appeals',
})
export class Appeal {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true, index: true })
  pointLogId: string;

  @Prop({ type: String, required: true, index: true })
  studentId: string;

  @Prop({ type: String, required: true, maxlength: 1000 })
  reason: string;

  @Prop({ 
    type: String, 
    enum: Object.values(AppealStatus), 
    default: AppealStatus.PENDING,
    index: true 
  })
  status: AppealStatus;

  @Prop({ type: Date, default: Date.now, index: true })
  submittedAt: Date;

  @Prop({ type: String, index: true })
  reviewedBy?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: String, maxlength: 1000 })
  reviewNotes?: string;

  @Prop({ type: String, required: true, index: true })
  academicYear: string;
}

export const AppealSchema = SchemaFactory.createForClass(Appeal);

// Create compound indexes for common queries
AppealSchema.index({ studentId: 1, academicYear: 1 });
AppealSchema.index({ status: 1, submittedAt: -1 });
AppealSchema.index({ reviewedBy: 1, reviewedAt: -1 });
AppealSchema.index({ academicYear: 1, status: 1 });

// Add text index for search functionality
AppealSchema.index({ reason: 'text', reviewNotes: 'text' });