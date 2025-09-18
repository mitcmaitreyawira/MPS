export declare class LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export declare class RegisterDto {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    termsAccepted: boolean;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class PasswordResetRequestDto {
    email: string;
}
export declare class PasswordResetDto {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class MfaVerificationDto {
    token: string;
    backupCode?: string;
}
//# sourceMappingURL=auth.dto.d.ts.map