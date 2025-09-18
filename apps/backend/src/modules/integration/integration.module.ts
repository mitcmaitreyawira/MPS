import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntegrationService } from './integration.service';
import { DataSyncService } from './data-sync.service';
import { IntegrationMonitorService } from './integration-monitor.service';
import { IntegrationController } from './integration.controller';
import { ValidationMiddleware } from './validation.middleware';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Class, ClassSchema } from '../../database/schemas/class.schema';
import { SyncOperation, SyncOperationSchema } from '../../database/schemas/sync-operation.schema';
import { PerformanceMetric, PerformanceMetricSchema, RequestTimer, RequestTimerSchema } from '../../database/schemas/performance-metric.schema';
import { CommonModule } from '../../common/common.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { QuestsModule } from '../quests/quests.module';
import { AppealsModule } from '../appeals/appeals.module';
import { PointLogsModule } from '../points/point-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Class.name, schema: ClassSchema },
      { name: SyncOperation.name, schema: SyncOperationSchema },
      { name: PerformanceMetric.name, schema: PerformanceMetricSchema },
      { name: RequestTimer.name, schema: RequestTimerSchema },
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
    AuditLogsModule,
    QuestsModule,
    AppealsModule,
    PointLogsModule,
  ],
  controllers: [IntegrationController],
  providers: [
    IntegrationService,
    DataSyncService,
    IntegrationMonitorService,
    ValidationMiddleware,
  ],
  exports: [
    IntegrationService,
    DataSyncService,
    IntegrationMonitorService,
    ValidationMiddleware,
  ],
})
export class IntegrationModule {}
