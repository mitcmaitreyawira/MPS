import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PasswordManagementController } from './password-management.controller';
import { PasswordManagementService } from './password-management.service';
import { PasswordPolicyConfig } from '../../common/config/password-policy.config';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
    JwtModule.register({}),
  ],
  controllers: [PasswordManagementController],
  providers: [
    PasswordManagementService,
    PasswordPolicyConfig,
    AuditService,
  ],
  exports: [PasswordManagementService, PasswordPolicyConfig],
})
export class PasswordManagementModule {}
