import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema()
export class UserProfile {
  @Prop()
  bio?: string;

  @Prop()
  phone?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ enum: ['male', 'female', 'other', 'prefer-not-to-say'] })
  gender?: string;

  @Prop()
  subject?: string;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({
    type: {
      website: String,
      twitter: String,
      linkedin: String,
      github: String,
    },
  })
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

@Schema()
export class UserPreferences {
  @Prop({ enum: ['light', 'dark', 'system'], default: 'system' })
  theme: string;

  @Prop({ default: 'en' })
  language: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true },
    },
  })
  pushNotifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: [String], select: false, default: [] })
  previousPasswords: string[];

  @Prop({ select: false })
  passwordChangedAt?: Date;

  @Prop({ default: 0, select: false })
  failedLoginAttempts: number;

  @Prop({ select: false })
  lockedUntil?: Date;

  @Prop({ type: Date, select: false })
  lastPasswordResetRequest?: Date;

  // Added: fields to support password reset flow
  @Prop({ type: String, select: false, required: false })
  passwordResetToken?: string | null;

  @Prop({ type: Date, select: false, required: false })
  passwordResetExpires?: Date | null;

  @Prop({ type: Number, default: 0, select: false })
  passwordResetAttempts?: number;

  @Prop({ unique: true, sparse: true, trim: true })
  username?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatar?: string;

  @Prop({ unique: true, sparse: true, trim: true })
  nisn?: string;

  @Prop({ type: Number, default: 0 })
  points?: number;

  @Prop({ type: [String], required: true })
  roles: string[];

  @Prop({ type: Types.ObjectId, ref: 'Class', required: false })
  classId?: Types.ObjectId;

  @Prop({ default: false })
  isArchived?: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ type: UserProfile })
  profile: UserProfile;

  @Prop({ type: UserPreferences })
  preferences: UserPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better query performance
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ nisn: 1 }, { unique: true });
UserSchema.index({ classId: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ isArchived: 1 });
UserSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
UserSchema.index({ classId: 1, isArchived: 1 });
UserSchema.index({ roles: 1, isArchived: 1 });
UserSchema.index({ isArchived: 1, createdAt: -1 });
UserSchema.index({ classId: 1, roles: 1 });
UserSchema.index({ nisn: 1, isArchived: 1 });

// Virtual for fullName
UserSchema.virtual('fullName').get(function () {
  const firstName = this.firstName || '';
  const lastName = this.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Anonymous User';
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Skip if password already looks like a bcrypt hash (pre-hashed in tests or migrations)
  const current: unknown = (this as any).password;
  if (typeof current === 'string' && current.startsWith('$2')) {
    return next();
  }
  const bcrypt = await import('bcrypt');
  ;(this as any).password = await bcrypt.hash((this as any).password, 12);
  next();
});

// Method to check password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Check if password needs to be changed
UserSchema.methods.isPasswordExpired = function(maxAgeDays: number): boolean {
  if (!this.passwordChangedAt) return false;

  const expirationDate = new Date(this.passwordChangedAt);
  expirationDate.setDate(expirationDate.getDate() + maxAgeDays);

  return new Date() > expirationDate;
};

// Check if account is locked
UserSchema.methods.isLocked = function(): boolean {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Increment failed login attempts and lock account if needed
UserSchema.methods.handleFailedLogin = async function(maxAttempts: number, lockoutMinutes: number) {
  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= maxAttempts) {
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + lockoutMinutes);
    this.lockedUntil = lockoutTime;
  }

  return this.save();
};

// Transform _id to id for JSON serialization
UserSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});