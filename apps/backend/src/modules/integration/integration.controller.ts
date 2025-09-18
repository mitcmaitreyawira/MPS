import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IntegrationService, IntegrationResult } from './integration.service';
import { DataSyncService, SyncResult, DataIntegrityReport } from './data-sync.service';
import { IntegrationMonitorService } from './integration-monitor.service';
import { ValidationMiddleware, DataTransformer } from './validation.middleware';

@ApiTags('Integration')
@Controller('integration')
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class IntegrationController {
  constructor(
    private integrationService: IntegrationService,
    private dataSyncService: DataSyncService,
    private monitorService: IntegrationMonitorService,
    private validationMiddleware: ValidationMiddleware,
  ) {}

  /**
   * Verify system integration
   */
  @Get('verify')
  @Roles('admin')
  @ApiOperation({ summary: 'Verify system integration health' })
  @ApiResponse({ status: 200, description: 'Integration verification result' })
  async verifyIntegration(): Promise<IntegrationResult> {
    return this.integrationService.verifySystemIntegration();
  }

  /**
   * Get connection pool status
   */
  @Get('connections')
  @Roles('admin')
  @ApiOperation({ summary: 'Get connection pool status' })
  @ApiResponse({ status: 200, description: 'Connection pool status' })
  getConnectionStatus() {
    const pools = this.integrationService.getConnectionPoolStatus();
    return {
      timestamp: new Date(),
      pools: Array.from(pools.values()),
    };
  }

  /**
   * Reset connection pool
   */
  @Post('connections/:poolId/reset')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a connection pool' })
  async resetConnectionPool(@Param('poolId') poolId: string) {
    await this.integrationService.resetConnectionPool(poolId);
    return { message: `Connection pool ${poolId} reset successfully` };
  }

  /**
   * Check data integrity
   */
  @Get('integrity')
  @Roles('admin')
  @ApiOperation({ summary: 'Check data integrity across all entities' })
  @ApiResponse({ status: 200, description: 'Data integrity report' })
  async checkIntegrity(): Promise<DataIntegrityReport> {
    return this.dataSyncService.checkDataIntegrity();
  }

  /**
   * Auto-fix integrity issues
   */
  @Post('integrity/auto-fix')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Automatically fix resolvable integrity issues' })
  async autoFixIntegrity(@Body() report: DataIntegrityReport): Promise<DataIntegrityReport> {
    return this.dataSyncService.autoFixIntegrityIssues(report);
  }

  /**
   * Get sync queue status
   */
  @Get('sync/queue')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get synchronization queue status' })
  getSyncQueueStatus() {
    return this.dataSyncService.getSyncQueueStatus();
  }

  /**
   * Process sync queue manually
   */
  @Post('sync/process')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger sync queue processing' })
  async processSyncQueue() {
    await this.dataSyncService.processSyncQueue();
    return { message: 'Sync queue processing initiated' };
  }

  /**
   * Execute synchronized operation
   */
  @Post('sync/execute')
  @Roles('admin')
  @ApiOperation({ summary: 'Execute a synchronized operation with transaction support' })
  async executeSyncOperation(
    @Body() body: { entity: string; action: string; data: any },
  ): Promise<SyncResult> {
    const validated = this.validationMiddleware.validateData(body.entity, body.data);
    if (!validated.valid) {
      throw new Error(`Validation failed: ${JSON.stringify(validated.errors)}`);
    }

    return this.dataSyncService.executeSyncOperation(
      async () => {
        // This would execute the actual operation
        // For now, return normalized data
        return DataTransformer.normalize(validated.sanitizedData, body.entity);
      },
      body.entity,
      body.action,
    );
  }

  /**
   * Get monitoring dashboard
   */
  @Get('monitor/dashboard')
  @Roles('admin')
  @ApiOperation({ summary: 'Get comprehensive monitoring dashboard data' })
  getMonitoringDashboard() {
    return this.monitorService.getMonitoringDashboard();
  }

  /**
   * Get performance benchmarks
   */
  @Get('monitor/benchmarks')
  @Roles('admin')
  @ApiOperation({ summary: 'Get performance benchmarks for all operations' })
  getBenchmarks() {
    return this.monitorService.getAllBenchmarks();
  }

  /**
   * Record benchmark
   */
  @Post('monitor/benchmark')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a performance benchmark' })
  recordBenchmark(@Body() body: { operation: string; duration: number }) {
    this.monitorService.recordBenchmark(body.operation, body.duration);
    return { message: 'Benchmark recorded' };
  }

  /**
   * Validate data
   */
  @Post('validate')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Validate data against entity schema' })
  validateData(@Body() body: { entity: string; data: any }) {
    const result = this.validationMiddleware.validateData(body.entity, body.data);
    return {
      valid: result.valid,
      errors: result.errors,
      sanitized: result.sanitizedData,
    };
  }

  /**
   * Validate batch data
   */
  @Post('validate/batch')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Validate batch data against entity schema' })
  validateBatch(@Body() body: { entity: string; items: any[] }) {
    return this.validationMiddleware.validateBatch(body.entity, body.items);
  }

  /**
   * Transform and normalize data
   */
  @Post('transform')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Transform and normalize data' })
  transformData(@Body() body: { entity: string; data: any }) {
    const normalized = DataTransformer.normalize(body.data, body.entity);
    const sanitized = DataTransformer.sanitize(normalized, body.entity);
    return {
      original: body.data,
      normalized,
      sanitized,
    };
  }
}
