import { ConfigService } from '@nestjs/config';
export declare class PasswordService {
    private readonly configService;
    constructor(configService: ConfigService);
    private get passwordPolicy();
    hashPassword(password: string): Promise<string>;
    comparePasswords(plainText: string, hashed: string): Promise<boolean>;
    validatePasswordStrength(password: string): void;
    generateStrongPassword(length?: number): string;
}
//# sourceMappingURL=password.service.d.ts.map