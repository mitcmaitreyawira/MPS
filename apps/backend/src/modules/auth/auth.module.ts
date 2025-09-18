import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { 
  User, 
  UserDocument, 
  UserSchema 
} from '../../database/schemas/user.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';
import { JwtCookieAuthGuard } from './jwt-cookie.guard';
import { RolesGuard } from './roles.guard';
import { UsersModule } from '../users/users.module';
import { PasswordService } from './services/password.service';
import { AuditService } from './services/audit.service';
import passwordPolicyConfig from './config/password-policy.config';
import { PasswordManagementModule } from '../password-management/password-management.module';

/**
 * The authentication module wires up the user model, JWT service and
 * configuration for issuing and verifying tokens.  It exposes the
 * AuthService and AuthController to the rest of the application.
 */
@Module({
  imports: [
    ConfigModule.forFeature(passwordPolicyConfig),
    UsersModule,
    PasswordManagementModule,
    // Register models
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    // Configure JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_ACCESS_SECRET') || 'dev_access_secret',
        signOptions: {
          expiresIn: cfg.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    PasswordService,
    AuditService,
    JwtCookieAuthGuard, 
    RolesGuard,
  ],
  exports: [
    AuthService, 
    PasswordService,
    AuditService,
    JwtModule, 
    JwtCookieAuthGuard, 
    RolesGuard,
  ],
})
export class AuthModule {}