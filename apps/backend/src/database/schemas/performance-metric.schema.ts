import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PerformanceMetricDocument = PerformanceMetric & Document;

@Schema({ timestamps: true })
export class PerformanceMetric {
  @Prop({ required: true })
  metricType: string; // 'request_time', 'database_operation', 'cache_operation', etc.

  @Prop({ required: true })
  operation: string; // The operation name or endpoint

  @Prop({ required: true })
  duration: number; // Duration in milliseconds

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: {
    method?: string;
    statusCode?: number;
    userId?: string;
    endpoint?: string;
    query?: string;
    error?: boolean;
    cacheHit?: boolean;
    found?: boolean;
    [key: string]: any;
  };

  @Prop()
  sessionId?: string;

  @Prop()
  correlationId?: string;

  @Prop({ default: false })
  isError: boolean;

  @Prop()
  errorMessage?: string;
}

export const PerformanceMetricSchema = SchemaFactory.createForClass(PerformanceMetric);

// Indexes for efficient querying and analytics
PerformanceMetricSchema.index({ metricType: 1, timestamp: -1 });
PerformanceMetricSchema.index({ operation: 1, timestamp: -1 });
PerformanceMetricSchema.index({ timestamp: -1 });
PerformanceMetricSchema.index({ isError: 1, timestamp: -1 });
PerformanceMetricSchema.index({ 'metadata.userId': 1, timestamp: -1 });
PerformanceMetricSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

@Schema({ timestamps: true })
export class RequestTimer {
  @Prop({ required: true, unique: true })
  timerId: string;

  @Prop({ required: true })
  operation: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop()
  duration?: number;

  @Prop({ default: 'active' })
  status: 'active' | 'completed' | 'abandoned';

  @Prop({ type: Object })
  metadata?: {
    [key: string]: any;
  };
}

export const RequestTimerSchema = SchemaFactory.createForClass(RequestTimer);

// Indexes for request timers
RequestTimerSchema.index({ timerId: 1 }, { unique: true });
RequestTimerSchema.index({ status: 1, startTime: -1 });
RequestTimerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 }); // Auto-delete after 24 hours

export type RequestTimerDocument = RequestTimer & Document;