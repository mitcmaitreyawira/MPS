export declare class CreateUserAddressDto {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}
export declare class CreateUserSocialLinksDto {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
}
export declare class CreateUserProfileDto {
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    subject?: string;
    address?: CreateUserAddressDto;
    socialLinks?: CreateUserSocialLinksDto;
}
export declare class CreateUserPushNotificationsDto {
    enabled?: boolean;
    sound?: boolean;
    vibration?: boolean;
}
export declare class CreateUserPreferencesDto {
    theme?: string;
    language?: string;
    timezone?: string;
    pushNotifications?: CreateUserPushNotificationsDto;
}
export declare class CreateUserDto {
    username?: string;
    password: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    nisn?: string;
    roles: string[];
    classId?: string;
    profile?: CreateUserProfileDto;
    preferences?: CreateUserPreferencesDto;
}
//# sourceMappingURL=create-user.dto.d.ts.map