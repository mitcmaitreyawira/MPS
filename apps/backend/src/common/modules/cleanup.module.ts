import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CleanupService } from '../services/cleanup.service';
import { CleanupController } from '../controllers/cleanup.controller';
import { PerformanceMetric, PerformanceMetricSchema } from '../../database/schemas/performance-metric.schema';
import { SyncOperation, SyncOperationSchema } from '../../database/schemas/sync-operation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PerformanceMetric.name, schema: PerformanceMetricSchema },
      { name: SyncOperation.name, schema: SyncOperationSchema },
    ]),
  ],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}