import { PasswordManagementService } from './password-management.service';
import { ChangePasswordDto, GeneratePasswordDto, ResetPasswordDto, InitiateResetDto } from './dto/change-password.dto';
export declare class PasswordManagementController {
    private readonly passwordManagementService;
    constructor(passwordManagementService: PasswordManagementService);
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: string;
            changedAt: Date;
            changedBy: any;
        };
    }>;
    generatePassword(generatePasswordDto: GeneratePasswordDto): Promise<{
        success: boolean;
        data: {
            password: string;
            strength: "weak" | "medium" | "strong";
            length: number;
        };
    }>;
    initiateReset(initiateResetDto: InitiateResetDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            token: string;
            expiresAt: Date;
            userId: string;
        };
    }>;
    resetWithToken(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getPasswordPolicy(): {
        success: boolean;
        data: import("../../common/config/password-policy.config").PasswordPolicy;
    };
    validatePassword(body: {
        password: string;
        userId?: string;
    }): Promise<{
        success: boolean;
        data: import("./password-management.service").PasswordValidationResult;
    }>;
}
//# sourceMappingURL=password-management.controller.d.ts.map