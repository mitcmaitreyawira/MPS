import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'ID of the user whose password will be changed',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId: string;

  @ApiProperty({
    description: 'New password for the user - any input is accepted',
    example: 'password'
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'Reason for password change (optional)',
    required: false,
    example: 'User requested password reset due to security concerns'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

export class GeneratePasswordDto {
  @ApiProperty({
    description: 'Length of generated password - any length is accepted',
    default: 16,
    required: false
  })
  @IsOptional()
  length?: number;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef'
  })
  @IsString()
  @MinLength(32, { message: 'Invalid reset token format' })
  token: string;

  @ApiProperty({
    description: 'New password - any input is accepted',
    example: 'password'
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'User ID (optional, for additional verification)',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class InitiateResetDto {
  @ApiProperty({
    description: 'ID of the user to initiate password reset for',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId: string;

  @ApiProperty({
    description: 'Reason for initiating reset (optional)',
    required: false,
    example: 'User forgot password'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}
