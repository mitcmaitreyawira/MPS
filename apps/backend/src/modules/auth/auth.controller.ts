import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { IsEmail, IsString, MinLength, ValidateIf, IsDefined } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth, ApiProperty } from '@nestjs/swagger';
import crypto from 'crypto';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtCookieAuthGuard } from './jwt-cookie.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PasswordManagementService } from '../password-management/password-management.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

class LoginDto {
  @ApiProperty({ description: 'User NISN', example: '1234567890' })
  @IsDefined()
  @IsString()
  nisn!: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  password!: string;
}

class LoginResponseDto {
  @ApiProperty({ description: 'Authenticated user information' })
  user!: {
    id: string;
    nisn: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };

  @ApiProperty({ description: 'Access token (JWT)', example: 'eyJhbGciOiJI...' })
  accessToken!: string;
}

class ProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ description: 'User NISN', example: '1234567890' })
  nisn!: string;

  @ApiProperty({ description: 'User first name', example: 'Gilbert' })
  firstName!: string;

  @ApiProperty({ description: 'User last name', example: 'Gilbert' })
  lastName!: string;

  @ApiProperty({ description: 'User roles', example: ['user'], isArray: true })
  roles!: string[];
}

class LogoutResponseDto {
  @ApiProperty({ description: 'Logout confirmation message', example: 'Logged out' })
  message!: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly passwordManagementService: PasswordManagementService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @Post('register')
  @HttpCode(403)
  @ApiOperation({ summary: 'User registration (disabled)', description: 'Public registration is disabled. Administrators can create accounts via the admin dashboard.' })
  @ApiBody({ type: CreateUserDto, description: 'User registration payload' })
  @ApiResponse({ status: 403, description: 'Registration disabled' })
  async register(@Body() _dto: CreateUserDto, @Res({ passthrough: true }) _res: Response) {
    throw new ForbiddenException('Public registration is disabled. Please contact an administrator.');
  }

  /**
   * Login endpoint accepts { nisn, password } for NISN-based authentication
   */
  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with NISN and password. Sets HttpOnly cookie for session management.' })
  @ApiBody({ type: LoginDto, description: 'User login credentials' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    this.logger.log('🔥 AUTH CONTROLLER LOGIN CALLED');
    this.logger.log(`🔥 Login DTO: ${JSON.stringify(dto, null, 2)}`);
    this.logger.log(`🔥 NISN: ${dto.nisn}`);
    this.logger.log(`🔥 Password: ${dto.password}`);
    const user = await this.authService.validate(dto.nisn, dto.password);
    const token = this.authService.signJwt(user);

    // HttpOnly JWT cookie
    res.cookie('access_token', token, this.authService.cookieOptions());

    // CSRF token cookie (readable, non-HttpOnly)
    const csrfToken = crypto.randomBytes(32).toString('hex');
    const baseCookieOpts = this.authService.cookieOptions();
    res.cookie('csrf_token', csrfToken, {
      ...baseCookieOpts,
      httpOnly: false,
      sameSite: baseCookieOpts.sameSite ?? ('lax' as any),
    } as any);

    // Send top-level accessToken to satisfy e2e expectations
    res.status(200).json({ accessToken: token, user: this.authService.sanitize(user) });
  }

  @Post('test-login')
  @ApiOperation({ summary: 'Test login without validation' })
  async testLogin(
    @Body() body: any,
  ): Promise<any> {
    try {
      const user = await this.authService.validate('ADMIN001', 'Admin123!');
      return { success: true, user: this.authService.sanitize(user) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'User logout', description: 'Clear authentication cookies and end user session.' })
  @ApiResponse({ status: 200, description: 'Logout successful', type: LogoutResponseDto })
  @ApiCookieAuth('access_token')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear cookies on logout
    const baseCookieOpts = this.authService.cookieOptions();
    res.cookie('access_token', '', { ...baseCookieOpts, maxAge: 0 });
    res.cookie('csrf_token', '', { ...baseCookieOpts, httpOnly: false, maxAge: 0 } as any);
    return { message: 'Logged out' };
  }

  @Get('profile')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: ProfileResponseDto })
  async profile(@Req() req: Request) {
    const token = (req as any).cookies?.['access_token'];
    if (!token) {
      throw new UnauthorizedException('No token');
    }
    const payload: any = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev_access_secret',
    });
    
    // Fetch complete user data from database
    const user = await this.userModel.findById(payload.sub).select('-password').exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    if (!user._id) {
      this.logger.error('User object missing _id field in profile endpoint:', user);
      throw new UnauthorizedException('Invalid user data');
    }
    
    return {
      id: user._id,
      nisn: user.nisn,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || [],
    };
  }

  // New endpoints to match e2e tests
  @Post('change-password')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Change own password' })
  async changePassword(@Req() req: Request, @Body() body: { currentPassword: string; newPassword: string }, @Res() res: Response) {
    try {
      const userPayload: any = (req as any).user;
      console.log('Password change - userPayload:', userPayload);
      if (!userPayload?.sub) throw new UnauthorizedException('Unauthorized');

      console.log('Password change - validating current password for:', userPayload.nisn);
      await this.authService.validate(userPayload.nisn, body.currentPassword).catch((err) => {
        console.error('Password validation failed:', err);
        throw new UnauthorizedException('Current password is incorrect');
      });

      // Hash and update (no validation - any password accepted)
      console.log('Password change - hashing new password');
      const hashed = await this.passwordManagementService.hashPassword(body.newPassword);
      console.log('Password change - updating user:', userPayload.id);
    await this.userModel.findByIdAndUpdate(userPayload.id, {
        password: hashed,
        passwordChangedAt: new Date(),
      });

      console.log('Password change - success');
      return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Password change error - full error:', error);
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  async requestPasswordReset(@Body() body: { nisn: string }, @Res() res: Response) {
    // Find user by NISN and generate reset token (but do not leak existence)
    const user = await this.userModel.findOne({ nisn: body.nisn });
    if (user) {
      await this.passwordManagementService.generateResetToken((user as any)._id.toString());
    }
    return res.status(202).json({ success: true, message: 'If the NISN exists, a reset token has been sent' });
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: { token: string; password: string }, @Res() res: Response) {
    try {
      console.log('Reset password - token:', body.token);
      console.log('Reset password - new password length:', body.password?.length);
      await this.passwordManagementService.resetPasswordWithToken(body.token, body.password);
      console.log('Reset password - success');
      return res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (err: any) {
      console.error('Reset password error:', err);
      // Normalize known validation errors to 400 to match e2e expectations
      const message = err?.message || 'Invalid or expired reset token';
      const status = err?.status && err.status >= 400 && err.status < 500 ? err.status : 400;
      return res.status(status).json({ success: false, message });
    }
  }

  @Get('test-db-connection')
  @ApiOperation({ summary: 'Test database connection and user query' })
  async testDbConnection() {
    try {
      console.log('=== TEST DB CONNECTION ENDPOINT ===');
      
      // Test basic connection
      const connectionState = this.userModel.db.readyState;
      console.log('Database connection state:', connectionState);
      console.log('Database name:', this.userModel.db.name);
      
      // Test user query with exact same logic as auth service
      const trimmedNisn = '1001234567'.trim();
      console.log('Searching for NISN:', `"${trimmedNisn}"`);
      
      const user = await this.userModel
        .findOne({ nisn: trimmedNisn })
        .select('+password')
        .exec();
      
      console.log('User found in test endpoint:', !!user);
      
      if (user) {
        console.log('User details:', {
          name: `${user.firstName} ${user.lastName}`,
          nisn: user.nisn,
          roles: user.roles,
          isArchived: user.isArchived
        });
        
        // Test password comparison
        const bcrypt = require('bcrypt');
        const passwordMatch = await bcrypt.compare('student123', user.password);
        console.log('Password match:', passwordMatch);
      }
      
      return {
        success: true,
        connectionState,
        databaseName: this.userModel.db.name,
        userFound: !!user,
        userDetails: user ? {
          name: `${user.firstName} ${user.lastName}`,
          nisn: user.nisn,
          roles: user.roles
        } : null
      };
    } catch (error) {
      console.error('Test endpoint error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }

}