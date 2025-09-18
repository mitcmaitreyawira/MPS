export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    profile?: UpdateUserProfileDto;
    preferences?: UpdateUserPreferencesDto;
}
export declare class UpdateUserProfileDto {
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
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
export declare class UpdateUserPreferencesDto {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    emailNotifications?: {
        marketing?: boolean;
        security?: boolean;
        productUpdates?: boolean;
        weeklyDigest?: boolean;
    };
    pushNotifications?: {
        enabled?: boolean;
        sound?: boolean;
        vibration?: boolean;
    };
}
//# sourceMappingURL=user.dto.d.ts.map