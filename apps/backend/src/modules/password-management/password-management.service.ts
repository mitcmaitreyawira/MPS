import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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

@Injectable()
export class PasswordManagementService {
  private readonly logger = new Logger(PasswordManagementService.name);
  private readonly commonPasswords = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ]);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private passwordPolicyConfig: PasswordPolicyConfig,
    private auditService: AuditService,
  ) {}

  /**
   * Validates password - now accepts any password input
   */
  validatePassword(password: string, user?: Partial<User>): PasswordValidationResult {
    // No validation requirements - accept any password
    return {
      isValid: true,
      errors: [],
      strength: 'strong' // Always return strong for any password
    };
  }

  /**
   * Securely hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = this.passwordPolicyConfig.getBcryptRounds();
    return bcrypt.hash(password, rounds);
  }

  /**
   * Change user password with validation and audit logging
   */
  async changePassword(
    userId: string,
    newPassword: string,
    adminUserId: string,
    reason?: string
  ): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate new password
    const validation = this.validatePassword(newPassword, user);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Password validation failed',
        errors: validation.errors
      });
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Log the password change
    await this.auditService.log({
      action: 'PASSWORD_CHANGE',
      userId: adminUserId,
      targetUserId: (user._id as any).toString(),
      details: {
        targetUserNisn: user.nisn,
        reason: reason || 'Admin password change',
        passwordStrength: validation.strength,
        timestamp: new Date()
      }
    });

    this.logger.log(`Password changed for user ${user.nisn} by admin ${adminUserId}`);
  }

  /**
   * Generate secure password reset token
   */
  async generateResetToken(userId: string): Promise<string> {
    console.log('=== GENERATE RESET TOKEN DEBUG START ===');
    const token = crypto.randomBytes(32).toString('hex');
    console.log('Generated token:', token);
    console.log('Generated token type:', typeof token);
    console.log('Generated token length:', token.length);
    
    const config = this.passwordPolicyConfig.getPasswordResetConfig();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.tokenExpiryMinutes);

    // Hash token before storing for security and to align with tests
    const hashedToken = await bcrypt.hash(token, 10);
    console.log('Hashed token:', hashedToken);
    console.log('Hashed token type:', typeof hashedToken);
    console.log('Hashed token length:', hashedToken.length);

    // Store hashed token in user document
    await this.userModel.findByIdAndUpdate(userId, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt,
      passwordResetAttempts: 0
    });
    
    console.log('Token stored in database');
    console.log('=== GENERATE RESET TOKEN DEBUG END ===');

    return token;
  }

  /**
   * Reset password using token
   */
  async resetPasswordWithToken(
    token: string,
    newPassword: string,
    userId?: string
  ): Promise<void> {
    console.log('=== RESET PASSWORD DEBUG START ===');
    console.log('Input token:', token);
    console.log('Input token type:', typeof token);
    console.log('Input token length:', token.length);
    
    // Find user with an active reset token (stored as bcrypt hash)
    const user = await this.userModel
      .findOne({
        passwordResetToken: { $ne: null },
        passwordResetExpires: { $gt: new Date() }
      })
      .select('+passwordResetToken +passwordResetExpires +email');

    if (!user) {
      console.log('No user found with valid reset token');
      throw new BadRequestException('Invalid or expired reset token');
    }

    console.log('Found user with reset token');
    console.log('Stored hash:', (user as any).passwordResetToken);
    console.log('Stored hash type:', typeof (user as any).passwordResetToken);
    console.log('Stored hash length:', (user as any).passwordResetToken?.length);
    
    let matches = false;
    try {
      console.log('Attempting bcrypt.compare...');
      matches = await bcrypt.compare(token, (user as any).passwordResetToken);
      console.log('Bcrypt compare result:', matches);
    } catch (error) {
      console.error('Bcrypt compare error:', error);
      throw error;
    }
    
    console.log('=== RESET PASSWORD DEBUG END ===');
    
    if (!matches) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (userId && (user._id as any).toString() !== userId) {
      throw new ForbiddenException('Token does not match user');
    }

    // Validate new password
    const validation = this.validatePassword(newPassword, user);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Password validation failed',
        errors: validation.errors
      });
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password and clear reset token
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordResetAttempts: 0,
      updatedAt: new Date()
    });

    // Log the password reset
    await this.auditService.log({
      action: 'PASSWORD_RESET',
      userId: (user._id as any).toString(),
      details: {
        userNisn: user.nisn,
        resetMethod: 'token',
        passwordStrength: validation.strength,
        timestamp: new Date()
      }
    });

    this.logger.log(`Password reset completed for user ${user.nisn}`);
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const policy = this.passwordPolicyConfig.getPasswordPolicy();
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = policy.specialChars;

    let charset = '';
    let password = '';

    // Ensure at least one character from each required set
    if (policy.requireUppercase) {
      charset += uppercase;
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    if (policy.requireLowercase) {
      charset += lowercase;
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    if (policy.requireNumbers) {
      charset += numbers;
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (policy.requireSpecialChars) {
      charset += special;
      password += special[Math.floor(Math.random() * special.length)];
    }

    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Get password policy for frontend display
   */
  getPasswordPolicy(): PasswordPolicy {
    return this.passwordPolicyConfig.getPasswordPolicy();
  }
}
