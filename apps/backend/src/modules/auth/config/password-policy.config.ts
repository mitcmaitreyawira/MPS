import { registerAs } from '@nestjs/config';

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  maxAgeDays: number;
  historySize: number;
}

export default registerAs(
  'passwordPolicy',
  (): PasswordPolicyConfig => ({
    minLength: 1, // Allow any length
    requireUppercase: false, // No uppercase requirement
    requireLowercase: false, // No lowercase requirement
    requireNumber: false, // No number requirement
    requireSpecialChar: false, // No special character requirement
    maxAgeDays: parseInt(process.env.PASSWORD_MAX_AGE_DAYS || '90'),
    historySize: parseInt(process.env.PASSWORD_HISTORY_SIZE || '5'),
  }),
);
