export declare class ChangePasswordDto {
    userId: string;
    newPassword: string;
    reason?: string;
}
export declare class GeneratePasswordDto {
    length?: number;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
    userId?: string;
}
export declare class InitiateResetDto {
    userId: string;
    reason?: string;
}
//# sourceMappingURL=change-password.dto.d.ts.map