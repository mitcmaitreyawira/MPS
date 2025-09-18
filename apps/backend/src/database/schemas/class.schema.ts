import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ClassDocument = Class & Document;

/**
 * Class schema for MongoDB.
 * Represents a classroom with a name and optional head teacher.
 */
@Schema({
  timestamps: true,
  collection: 'classes',
})
export class Class {
  @ApiProperty({ description: 'Unique identifier for the class' })
  _id: Types.ObjectId;

  @ApiProperty({ description: 'Class name', example: 'Grade 10A' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Head teacher ID', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  headTeacherId?: Types.ObjectId;

  @ApiProperty({ description: 'Array of student IDs in this class', required: false })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  students?: Types.ObjectId[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

// Add indexes for better query performance
ClassSchema.index({ name: 1 });
ClassSchema.index({ headTeacherId: 1 });

// Transform _id to id for frontend compatibility
ClassSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});