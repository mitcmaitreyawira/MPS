import { ConfigService } from '@nestjs/config';
export interface PasswordPolicy {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialChars: string;
    preventCommonPasswords: boolean;
    preventUserInfoInPassword: boolean;
    maxAttempts: number;
    lockoutDuration: number;
}
export interface PasswordResetConfig {
    tokenExpiryMinutes: number;
    maxResetAttempts: number;
    cooldownMinutes: number;
    requireEmailVerification: boolean;
    notifyUserOnReset: boolean;
}
export declare class PasswordPolicyConfig {
    private configService;
    constructor(configService: ConfigService);
    getPasswordPolicy(): PasswordPolicy;
    getPasswordResetConfig(): PasswordResetConfig;
    getBcryptRounds(): number;
}
//# sourceMappingURL=password-policy.config.d.ts.map