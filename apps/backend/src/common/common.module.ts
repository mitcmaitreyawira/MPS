import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from './services/cache.service';
import { PerformanceService } from './services/performance.service';
import { StructuredLoggerService } from './services/logger.service';
import { PerformanceMetric, PerformanceMetricSchema, RequestTimer, RequestTimerSchema } from '../database/schemas/performance-metric.schema';

/**
 * CommonModule provides shared services that can be used across the application.
 * This includes caching, performance monitoring, logging, and other utility services.
 * Note: CacheModule is configured globally in AppModule, so we don't need to import it here.
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: PerformanceMetric.name, schema: PerformanceMetricSchema },
      { name: RequestTimer.name, schema: RequestTimerSchema },
    ]),
  ],
  providers: [CacheService, PerformanceService, StructuredLoggerService],
  exports: [CacheService, PerformanceService, StructuredLoggerService],
})
export class CommonModule {}