import { Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { CleanupService } from '../services/cleanup.service';
import { JwtCookieAuthGuard } from '../../modules/auth/jwt-cookie.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';

@ApiTags('Cleanup')
@Controller('cleanup')
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@Roles('admin')
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('performance-metrics')
  @ApiOperation({ summary: 'Manually clean up old performance metrics' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async cleanupPerformanceMetrics() {
    await this.cleanupService.cleanupOldPerformanceMetrics();
    return { message: 'Performance metrics cleanup completed' };
  }

  @Post('sync-operations')
  @ApiOperation({ summary: 'Manually clean up completed sync operations' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async cleanupSyncOperations() {
    await this.cleanupService.cleanupCompletedSyncOperations();
    return { message: 'Sync operations cleanup completed' };
  }

  @Post('failed-operations')
  @ApiOperation({ summary: 'Manually clean up old failed sync operations' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async cleanupFailedOperations() {
    await this.cleanupService.cleanupFailedSyncOperations();
    return { message: 'Failed operations cleanup completed' };
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Perform comprehensive monthly maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance completed successfully' })
  async performMaintenance() {
    await this.cleanupService.performMonthlyMaintenance();
    return { message: 'Monthly maintenance completed' };
  }

  @Post('manual')
  @ApiOperation({ summary: 'Perform manual cleanup with custom parameters' })
  @ApiQuery({ name: 'metricsOlderThanDays', required: false, type: Number, description: 'Delete metrics older than N days (default: 30)' })
  @ApiQuery({ name: 'syncOlderThanDays', required: false, type: Number, description: 'Delete sync operations older than N days (default: 7)' })
  @ApiQuery({ name: 'dryRun', required: false, type: Boolean, description: 'Perform dry run without actual deletion (default: false)' })
  @ApiResponse({ status: 200, description: 'Manual cleanup completed successfully' })
  async performManualCleanup(
    @Query('metricsOlderThanDays') metricsOlderThanDays?: number,
    @Query('syncOlderThanDays') syncOlderThanDays?: number,
    @Query('dryRun') dryRun?: boolean,
  ) {
    const result = await this.cleanupService.performManualCleanup({
      metricsOlderThanDays: metricsOlderThanDays ? Number(metricsOlderThanDays) : undefined,
      syncOlderThanDays: syncOlderThanDays ? Number(syncOlderThanDays) : undefined,
      dryRun: dryRun === true || String(dryRun) === 'true',
    });

    return {
      message: 'Manual cleanup completed',
      result,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get cleanup service status and database statistics' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  async getCleanupStatus() {
    // This would require additional methods in CleanupService to get statistics
    return {
      message: 'Cleanup service is running',
      scheduledJobs: [
        { name: 'Performance Metrics Cleanup', schedule: 'Daily at 2:00 AM', description: 'Removes metrics older than 30 days' },
        { name: 'Completed Sync Operations Cleanup', schedule: 'Daily at 2:30 AM', description: 'Removes completed operations older than 7 days' },
        { name: 'Failed Sync Operations Cleanup', schedule: 'Weekly on Sunday at 3:00 AM', description: 'Removes failed operations older than 30 days' },
        { name: 'Monthly Maintenance', schedule: 'Monthly on 1st at 4:00 AM', description: 'Comprehensive cleanup and database optimization' },
      ],
    };
  }
}