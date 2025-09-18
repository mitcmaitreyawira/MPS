import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from '../../database/schemas/user.schema';

/**
 * AuthService encapsulates authentication related operations: validating
 * credentials, generating JWT tokens, sanitising user data for exposure
 * outside the service, and producing cookie options consistent with
 * environment configuration.  In production you'd add refresh token
 * support, role-based checks and MFA flows here.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate user credentials by checking NISN and password against the database.
   * 
   * @param nisn - User's NISN
   * @param password - Plain text password to verify
   * @returns Promise resolving to the authenticated user document
   * @throws {UnauthorizedException} When credentials are invalid or user not found
   * 
   * @example
   * ```typescript
   * const user = await authService.validate('1001234567', 'password123');
   * ```
   */
  async validate(nisn: string, password: string): Promise<UserDocument> {
    this.logger.error(`🔍 AUTH VALIDATE CALLED - NISN: "${nisn}", Password: "${password}"`);
    this.logger.error(`NISN type: ${typeof nisn}, length: ${nisn?.length}`);
    this.logger.error(`Password type: ${typeof password}, length: ${password?.length}`);
    
    // Trim and normalize inputs
    const trimmedNisn = nisn?.toString().trim();
    const trimmedPassword = password?.toString().trim();
    this.logger.error(`Trimmed NISN: "${trimmedNisn}", Trimmed Password: "${trimmedPassword}"`);
    
    // Find user by NISN
    const user: UserDocument | null = await this.userModel
      .findOne({ nisn: trimmedNisn })
      .select('+password')
      .exec();
    
    this.logger.error(`User found: ${!!user}`);
    if (user) {
      this.logger.error(`User name: ${user.firstName} ${user.lastName}`);
      this.logger.error(`User NISN: "${user.nisn}"`);
      this.logger.error(`User has password: ${!!(user as any).password}`);
      this.logger.error(`Password hash: ${(user as any).password}`);
    } else {
      this.logger.error('No user found, throwing error');
    }
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.error(`About to compare: "${trimmedPassword}" with hash "${(user as any).password}"`);
    const match = await bcrypt.compare(trimmedPassword, (user as any).password);
    this.logger.error(`Password match result: ${match}`);
    if (!match) {
      this.logger.error('Password does not match, throwing error');
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.error('Authentication successful, returning user');
    return user;
  }

  /**
   * Generate JWT token for authenticated user.
   * 
   * @param user - Authenticated user document
   * @returns Signed JWT token string
   * 
   * @example
   * ```typescript
   * const token = authService.signJwt(user);
   * // Token payload: { sub: userId, nisn: userNisn, roles: userRoles }
   * ```
   */
  signJwt(user: User): string {
    const payload = {
      sub: String((user as any).id ?? (user as any)._id),
      nisn: user.nisn,
      roles: (user as any).roles || [],
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Remove sensitive information from user object before sending to client.
   * 
   * @param user - Raw user document from database
   * @returns Sanitized user object without password and sensitive fields
   * 
   * @example
   * ```typescript
   * const safeUser = authService.sanitize(user);
   * // Returns user without password, __v, and other internal fields
   * ```
   */
  sanitize(user: any): Record<string, any> {
    if (!user) {
      this.logger.error('Sanitize called with null/undefined user');
      throw new UnauthorizedException('User data not available');
    }
    
    if (!user._id) {
      this.logger.error('User object missing _id field:', user);
      throw new UnauthorizedException('Invalid user data');
    }
    
    return {
      id: user._id.toString(),
      nisn: user.nisn,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || [],
    };
  }

  /**
   * Generate secure cookie configuration options based on environment settings.
   * 
   * @returns Cookie options object with security settings
   * 
   * @example
   * ```typescript
   * const options = authService.cookieOptions();
   * // Returns: { httpOnly: true, secure: true, sameSite: 'strict', maxAge: ... }
   * ```
   */
  cookieOptions(): { [key: string]: any } {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/',
    };
  }
}