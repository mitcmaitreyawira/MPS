import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordPolicyConfig } from '../config/password-policy.config';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  private get passwordPolicy(): PasswordPolicyConfig {
    const policy = this.configService.get<PasswordPolicyConfig>('passwordPolicy');
    if (!policy) {
      throw new Error('Password policy configuration is missing');
    }
    return policy;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  validatePasswordStrength(password: string): void {
    // No password strength validation - accept any password
    return;
  }

  generateStrongPassword(length = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyz' +
                   'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                   '0123456789' +
                   '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    
    let password = '';
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      const value = values[i];
      if (value === undefined) continue;
      const charIndex = value % charset.length;
      password += charset[charIndex];
    }
    
    // No validation required - return generated password
    return password;
  }
}
