import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { QuestsModule } from './modules/quests/quests.module';
import { AppealsModule } from './modules/appeals/appeals.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ActionPresetsModule } from './modules/action-presets/action-presets.module';
import { TeacherReportsModule } from './modules/teacher-reports/teacher-reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PasswordManagementModule } from './modules/password-management/password-management.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { DataModule } from './modules/data/data.module';
import { IntegrationModule } from './modules/integration/integration.module';
// import { AdminModule } from './modules/admin/admin.module';

import { PointLogsModule } from './modules/points/point-logs.module';
// import { CleanupModule } from './common/modules/cleanup.module';
import { StructuredLoggerService } from './common/services/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri')!,
        useNewUrlParser: true as any,
        useUnifiedTopology: true as any,
        // Connection pool optimization for increased load
        maxPoolSize: 50, // Maximum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server
        socketTimeoutMS: 45000, // How long a send or receive on a socket can take
        connectTimeoutMS: 10000, // How long to wait for a connection to be established
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: Number(config.get('cache.ttl') ?? 300) * 1000, // Convert to milliseconds
        max: 500, // Maximum number of items in cache
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: Number(config.get('throttle.ttl') ?? 60),
            limit: Number(config.get('throttle.limit') ?? 100),
          },
        ],
      }),
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        level: config.get('LOG_LEVEL') || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
      }),
    }),
    // ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    HealthModule,
    ClassesModule,
    ActionPresetsModule,
    NotificationsModule,
    AuditLogsModule,
    QuestsModule,
    AppealsModule,
    TeacherReportsModule,
    PasswordManagementModule,
    DataModule,
    DashboardsModule,
    IntegrationModule,
    // AdminModule,
    // CleanupModule,
    PointLogsModule,
  ],
  providers: [
    StructuredLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
