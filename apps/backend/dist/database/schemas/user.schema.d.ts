import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class UserProfile {
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    subject?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    socialLinks?: {
        website?: string;
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
}
export declare class UserPreferences {
    theme: string;
    language: string;
    timezone: string;
    pushNotifications: {
        enabled: boolean;
        sound: boolean;
        vibration: boolean;
    };
}
export declare class User {
    password: string;
    previousPasswords: string[];
    passwordChangedAt?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    lastPasswordResetRequest?: Date;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    passwordResetAttempts?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    nisn?: string;
    points?: number;
    roles: string[];
    classId?: Types.ObjectId;
    isArchived?: boolean;
    deletedAt?: Date | null;
    lastLoginAt?: Date;
    profile: UserProfile;
    preferences: UserPreferences;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=user.schema.d.ts.map