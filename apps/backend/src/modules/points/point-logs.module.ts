import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PointLogsService } from './point-logs.service';
import { PointLogsController } from './point-logs.controller';
import { PointsController } from './points.controller';
import { CommonModule } from '../../common/common.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [JwtModule, CommonModule, DatabaseModule],
  controllers: [PointLogsController, PointsController],
  providers: [PointLogsService],
  exports: [PointLogsService],
})
export class PointLogsModule {}