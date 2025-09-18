import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { PasswordManagementService } from './password-management.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ChangePasswordDto,
  GeneratePasswordDto,
  ResetPasswordDto,
  InitiateResetDto,
} from './dto/change-password.dto';

@ApiTags('Password Management')
@Controller('password-management')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PasswordManagementController {
  constructor(
    private readonly passwordManagementService: PasswordManagementService,
  ) {}

  @Post('change-password')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change user password (Admin only)',
    description: 'Allows administrators to securely change any user\'s password with validation and audit logging',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password changed successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            changedAt: { type: 'string', format: 'date-time' },
            changedBy: { type: 'string', example: '507f1f77bcf86cd799439012' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Password validation failed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    await this.passwordManagementService.changePassword(
      changePasswordDto.userId,
      changePasswordDto.newPassword,
      req.user.id,
      changePasswordDto.reason,
    );

    return {
      success: true,
      message: 'Password changed successfully',
      data: {
        userId: changePasswordDto.userId,
        changedAt: new Date(),
        changedBy: req.user.id,
      },
    };
  }

  @Post('generate-password')
  @Roles('admin')
  @ApiOperation({
    summary: 'Generate secure password',
    description: 'Generates a cryptographically secure password that meets policy requirements',
  })
  @ApiResponse({
    status: 200,
    description: 'Password generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            password: { type: 'string', example: 'Xy9#mK2$pL8@nQ5!' },
            strength: { type: 'string', enum: ['weak', 'medium', 'strong'], example: 'strong' },
            length: { type: 'number', example: 16 },
          },
        },
      },
    },
  })
  async generatePassword(@Body() generatePasswordDto: GeneratePasswordDto) {
    const length = generatePasswordDto.length || 16;
    const password = this.passwordManagementService.generateSecurePassword(length);
    const validation = this.passwordManagementService.validatePassword(password);

    return {
      success: true,
      data: {
        password,
        strength: validation.strength,
        length: password.length,
      },
    };
  }

  @Post('initiate-reset')
  @Roles('admin')
  @ApiOperation({
    summary: 'Initiate password reset',
    description: 'Generates a secure reset token for a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset token generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reset token generated successfully' },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'a1b2c3d4e5f6789012345678901234567890abcdef' },
            expiresAt: { type: 'string', format: 'date-time' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      },
    },
  })
  async initiateReset(
    @Body() initiateResetDto: InitiateResetDto,
    @Request() req: any,
  ) {
    const token = await this.passwordManagementService.generateResetToken(
      initiateResetDto.userId,
    );

    const config = this.passwordManagementService.getPasswordPolicy();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Default 30 minutes

    return {
      success: true,
      message: 'Reset token generated successfully',
      data: {
        token,
        expiresAt,
        userId: initiateResetDto.userId,
      },
    };
  }

  @Post('reset-with-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Resets password using a valid reset token',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password reset successfully' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token or password validation failed' })
  async resetWithToken(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.passwordManagementService.resetPasswordWithToken(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      resetPasswordDto.userId,
    );

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  @Get('policy')
  @Roles('admin', 'teacher')
  @ApiOperation({
    summary: 'Get password policy',
    description: 'Returns the current password policy configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Password policy retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            minLength: { type: 'number', example: 8 },
            maxLength: { type: 'number', example: 128 },
            requireUppercase: { type: 'boolean', example: true },
            requireLowercase: { type: 'boolean', example: true },
            requireNumbers: { type: 'boolean', example: true },
            requireSpecialChars: { type: 'boolean', example: true },
            specialChars: { type: 'string', example: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
          },
        },
      },
    },
  })
  getPasswordPolicy() {
    const policy = this.passwordManagementService.getPasswordPolicy();
    return {
      success: true,
      data: policy,
    };
  }

  @Post('validate-password')
  @Roles('admin', 'teacher')
  @ApiOperation({
    summary: 'Validate password',
    description: 'Validates a password against the current policy without storing it',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'TestPassword123!' },
        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      },
      required: ['password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password validation result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean', example: true },
            errors: { type: 'array', items: { type: 'string' }, example: [] },
            strength: { type: 'string', enum: ['weak', 'medium', 'strong'], example: 'strong' },
          },
        },
      },
    },
  })
  async validatePassword(@Body() body: { password: string; userId?: string }) {
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    const validation = this.passwordManagementService.validatePassword(
      body.password,
      body.userId ? { nisn: body.userId } : undefined,
    );

    return {
      success: true,
      data: validation,
    };
  }
}
