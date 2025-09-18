import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { PasswordPolicyConfig, PasswordPolicy } from '../../common/config/password-policy.config';
import { AuditService } from '../../common/services/audit.service';
export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
}
export interface PasswordResetToken {
    userId: string;
    token: string;
    expiresAt: Date;
    attempts: number;
    createdAt: Date;
}
export declare class PasswordManagementService {
    private userModel;
    private passwordPolicyConfig;
    private auditService;
    private readonly logger;
    private readonly commonPasswords;
    constructor(userModel: Model<UserDocument>, passwordPolicyConfig: PasswordPolicyConfig, auditService: AuditService);
    validatePassword(password: string, user?: Partial<User>): PasswordValidationResult;
    hashPassword(password: string): Promise<string>;
    changePassword(userId: string, newPassword: string, adminUserId: string, reason?: string): Promise<void>;
    generateResetToken(userId: string): Promise<string>;
    resetPasswordWithToken(token: string, newPassword: string, userId?: string): Promise<void>;
    generateSecurePassword(length?: number): string;
    getPasswordPolicy(): PasswordPolicy;
}
//# sourceMappingURL=password-management.service.d.ts.map