import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestParticipantDocument = QuestParticipant & Document;

export enum QuestCompletionStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED_FOR_REVIEW = 'submitted_for_review',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class QuestParticipant {
  @Prop({ type: Types.ObjectId, ref: 'Quest', required: true })
  questId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ enum: QuestCompletionStatus, default: QuestCompletionStatus.IN_PROGRESS })
  status: QuestCompletionStatus;

  @Prop()
  submittedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  reviewNotes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  submissionNotes?: string;

  @Prop([String])
  attachments?: string[];

  @Prop()
  academicYear?: string;

  @Prop({ type: Types.ObjectId, ref: 'PointLog' })
  pointLogId?: Types.ObjectId;
}

export const QuestParticipantSchema = SchemaFactory.createForClass(QuestParticipant);

// Compound unique index to prevent duplicate participation
QuestParticipantSchema.index({ questId: 1, studentId: 1 }, { unique: true });

// Indexes for performance
QuestParticipantSchema.index({ questId: 1 });
QuestParticipantSchema.index({ studentId: 1 });
QuestParticipantSchema.index({ status: 1 });
QuestParticipantSchema.index({ createdAt: -1 });
QuestParticipantSchema.index({ academicYear: 1 });
QuestParticipantSchema.index({ questId: 1, status: 1 });
QuestParticipantSchema.index({ studentId: 1, status: 1 });
QuestParticipantSchema.index({ studentId: 1, academicYear: 1 });
QuestParticipantSchema.index({ submittedAt: 1 });
QuestParticipantSchema.index({ completedAt: 1 });

// Virtual for duration calculations
QuestParticipantSchema.virtual('duration').get(function () {
  if (this.completedAt && (this as any).createdAt) {
    return this.completedAt.getTime() - (this as any).createdAt.getTime();
  }
  return null;
});

// Pre-save middleware to set timestamps and academic year
QuestParticipantSchema.pre('save', function (next) {
  const now = new Date();
  
  // Set submission timestamp when status changes to submitted
  if (this.isModified('status') && this.status === QuestCompletionStatus.SUBMITTED_FOR_REVIEW && !this.submittedAt) {
    this.submittedAt = now;
  }
  
  // Set completion timestamp when status changes to completed
  if (this.isModified('status') && this.status === QuestCompletionStatus.COMPLETED && !this.completedAt) {
    this.completedAt = now;
  }
  
  // Set academic year if not provided
  if (!this.academicYear) {
    const year = now.getFullYear();
    const month = now.getMonth();
    // Academic year starts in August (month 7)
    const academicStartYear = month >= 7 ? year : year - 1;
    this.academicYear = `${academicStartYear}-${academicStartYear + 1}`;
  }
  
  next();
});