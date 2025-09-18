import { Injectable } from '@nestjs/common';
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
  lockoutDuration: number; // in minutes
}

export interface PasswordResetConfig {
  tokenExpiryMinutes: number;
  maxResetAttempts: number;
  cooldownMinutes: number;
  requireEmailVerification: boolean;
  notifyUserOnReset: boolean;
}

@Injectable()
export class PasswordPolicyConfig {
  constructor(private configService: ConfigService) {}

  getPasswordPolicy(): PasswordPolicy {
    return {
      minLength: 1, // Allow any length
      maxLength: 1000, // Very high limit
      requireUppercase: false, // No uppercase requirement
      requireLowercase: false, // No lowercase requirement
      requireNumbers: false, // No number requirement
      requireSpecialChars: false, // No special character requirement
      specialChars: this.configService.get<string>('PASSWORD_SPECIAL_CHARS', '!@#$%^&*()_+-=[]{}|;:,.<>?'),
      preventCommonPasswords: false, // Allow common passwords
      preventUserInfoInPassword: false, // Allow user info in password
      maxAttempts: this.configService.get<number>('PASSWORD_MAX_ATTEMPTS', 5),
      lockoutDuration: this.configService.get<number>('PASSWORD_LOCKOUT_DURATION', 15),
    };
  }

  getPasswordResetConfig(): PasswordResetConfig {
    return {
      tokenExpiryMinutes: this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRY', 30),
      maxResetAttempts: this.configService.get<number>('PASSWORD_RESET_MAX_ATTEMPTS', 3),
      cooldownMinutes: this.configService.get<number>('PASSWORD_RESET_COOLDOWN', 60),
      requireEmailVerification: this.configService.get<boolean>('PASSWORD_RESET_REQUIRE_EMAIL', true),
      notifyUserOnReset: this.configService.get<boolean>('PASSWORD_RESET_NOTIFY_USER', true),
    };
  }

  getBcryptRounds(): number {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    return typeof rounds === 'string' ? parseInt(rounds, 10) : rounds;
  }
}
