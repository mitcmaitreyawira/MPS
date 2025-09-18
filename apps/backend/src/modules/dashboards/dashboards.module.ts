import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { CommonModule } from '../../common/common.module';
import { QuestsModule } from '../quests/quests.module';
import { AppealsModule } from '../appeals/appeals.module';
import { PointLogsModule } from '../points/point-logs.module';
import { TeacherReportsModule } from '../teacher-reports/teacher-reports.module';
import { ActionPresetsModule } from '../action-presets/action-presets.module';
import { ClassesModule } from '../classes/classes.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AwardsModule } from '../awards/awards.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule,
    AuthModule,
    CommonModule,
    QuestsModule,
    AppealsModule,
    PointLogsModule,
    TeacherReportsModule,
    ActionPresetsModule,
    ClassesModule,
    AuditLogsModule,
    AwardsModule,
  ],
  controllers: [DashboardsController],
  providers: [DashboardsService],
  exports: [DashboardsService],
})
export class DashboardsModule {}