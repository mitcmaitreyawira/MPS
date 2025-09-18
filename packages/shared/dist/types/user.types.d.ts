import { BaseEntity } from './common.types';
import { Role } from './auth.types';
export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isEmailVerified: boolean;
    isMfaEnabled: boolean;
    roles: Role[];
    lastLoginAt?: Date;
    accountStatus: AccountStatus;
    preferences: UserPreferences;
    profile: UserProfile;
}
export interface UserProfile {
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    address?: Address;
    socialLinks?: SocialLinks;
}
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export interface SocialLinks {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    emailNotifications: EmailNotificationSettings;
    pushNotifications: PushNotificationSettings;
}
export interface EmailNotificationSettings {
    marketing: boolean;
    security: boolean;
    productUpdates: boolean;
    weeklyDigest: boolean;
}
export interface PushNotificationSettings {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
}
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    profile?: Partial<UserProfile>;
    preferences?: Partial<UserPreferences>;
}
export interface UserSearchFilters {
    role?: string;
    status?: AccountStatus;
    isEmailVerified?: boolean;
    isMfaEnabled?: boolean;
}
//# sourceMappingURL=user.types.d.ts.map