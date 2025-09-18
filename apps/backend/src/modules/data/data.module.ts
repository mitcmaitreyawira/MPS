import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { UsersModule } from '../users/users.module';
import { PointLogsModule } from '../points/point-logs.module';
import { ActionPresetsModule } from '../action-presets/action-presets.module';
import { AuthModule } from '../auth/auth.module';

/**
 * DataModule provides general data endpoints that don't fit into specific feature modules.
 * This includes academic years, system configuration, and other utility data.
 */
@Module({
  imports: [UsersModule, PointLogsModule, ActionPresetsModule, AuthModule],
  controllers: [DataController],
})
export class DataModule {}