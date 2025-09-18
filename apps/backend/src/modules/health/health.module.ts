import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HealthController } from './health.controller';
import { CommonModule } from '../../common/common.module';

/**
 * HealthModule exposes a simple healthcheck endpoint so external systems
 * (load balancers, uptime monitors) can verify that the application is
 * running.  It could be expanded to perform deeper dependency checks.
 */
@Module({
  imports: [JwtModule, CommonModule],
  controllers: [HealthController],
})
export class HealthModule {}