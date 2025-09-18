export declare class UpdateUserAddressDto {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}
export declare class UpdateUserSocialLinksDto {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
}
export declare class UpdateUserProfileDto {
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    subject?: string;
    address?: UpdateUserAddressDto;
    socialLinks?: UpdateUserSocialLinksDto;
}
export declare class UpdateUserPushNotificationsDto {
    enabled?: boolean;
    sound?: boolean;
    vibration?: boolean;
}
export declare class UpdateUserPreferencesDto {
    theme?: string;
    language?: string;
    timezone?: string;
    pushNotifications?: UpdateUserPushNotificationsDto;
}
export declare class UpdateUserDto {
    name?: string;
    points?: number;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    roles?: string[];
    classId?: string;
    profile?: UpdateUserProfileDto;
    preferences?: UpdateUserPreferencesDto;
}
//# sourceMappingURL=update-user.dto.d.ts.map