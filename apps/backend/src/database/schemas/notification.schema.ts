import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'notifications',
})
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Add indexes for better query performance
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ timestamp: -1 });

// Compound indexes for common query patterns
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, timestamp: -1 });
NotificationSchema.index({ isRead: 1, timestamp: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, timestamp: -1 });

// Transform for JSON serialization
NotificationSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});