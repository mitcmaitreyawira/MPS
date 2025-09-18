import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';
import { CommonModule } from '../../common/common.module';
import { ErrorResponseService } from '../../common/services/error-response.service';
import { PointLogsModule } from '../points/point-logs.module';
import { AuditService } from '../auth/services/audit.service';

/**
 * The UsersModule wires together the user model, service and controller.
 * It exposes basic CRUD operations over users with caching and performance monitoring.
 * In a real application you'd secure these routes with role guards and implement
 * additional pagination and search functionality.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema }
    ]),
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
    CommonModule,
    PointLogsModule,
  ],
  providers: [UsersService, ErrorResponseService, AuditService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}