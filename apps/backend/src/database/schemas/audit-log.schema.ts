import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditAction } from '../../modules/auth/enums/audit-action.enum';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, required: true, enum: Object.values(AuditAction) })
  action: AuditAction;

  @Prop({ type: String, required: true })
  resource: string;

  @Prop({ type: String, required: true })
  resourceId: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Index for faster querying
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ 'data.ipAddress': 1 });
