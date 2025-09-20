import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SyncOperationDocument = SyncOperation & Document;

@Schema({ timestamps: true })
export class SyncOperation {
  @Prop({ required: true, unique: true })
  operationId: string;

  @Prop({ required: true, enum: ['create', 'update', 'delete', 'reconcile'] })
  type: 'create' | 'update' | 'delete' | 'reconcile';

  @Prop({ required: true })
  entity: string;

  @Prop({ type: Object, default: {} })
  data: any;

  @Prop({ required: true, enum: ['pending', 'processing', 'completed', 'failed'] })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop({ default: 0 })
  retries: number;

  @Prop()
  error?: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: Date.now })
  lastProcessed?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 3 })
  maxRetries: number;

  @Prop({ type: Object })
  metadata?: {
    priority?: 'low' | 'medium' | 'high';
    source?: string;
    correlationId?: string;
    [key: string]: any;
  };
}

export const SyncOperationSchema = SchemaFactory.createForClass(SyncOperation);

// Indexes for efficient querying
SyncOperationSchema.index({ status: 1, timestamp: 1 });
SyncOperationSchema.index({ operationId: 1 }, { unique: true });
SyncOperationSchema.index({ entity: 1, type: 1 });
// TTL index managed by EphemeralCollectionsService