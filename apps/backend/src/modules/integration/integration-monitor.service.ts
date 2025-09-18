import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { DataSyncService } from './data-sync.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

export interface MonitoringMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold?: {
    warning: number;
    critical: number;
  };
  status: 'normal' | 'warning' | 'critical';
}

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  consecutiveFailures: number;
  details?: any;
}

export interface PerformanceBenchmark {
  operation: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  sampleSize: number;
  timestamp: Date;
}

@Injectable()
export class IntegrationMonitorService implements OnModuleDestroy {
  private readonly logger = new Logger(IntegrationMonitorService.name);
  private healthChecks = new Map<string, HealthCheckResult>();
  private metrics = new Map<string, MonitoringMetric[]>();
  private benchmarks = new Map<string, number[]>();
  private alertThresholds = {
    responseTime: { warning: 1000, critical: 5000 },
    errorRate: { warning: 0.05, critical: 0.1 },
    availability: { warning: 0.99, critical: 0.95 },
  };
  private timers: NodeJS.Timeout[] = [];

  constructor(
    private integrationService: IntegrationService,
    private dataSyncService: DataSyncService,
    private auditService: AuditLogsService,
  ) {
    this.initializeMonitoring();
    // Manual scheduling to avoid @nestjs/schedule dependency
    this.timers.push(setInterval(() => this.performHealthChecks().catch(() => undefined), 60_000));
    this.timers.push(setInterval(() => this.performIntegrityCheck().catch(() => undefined), 60 * 60_000));
    this.timers.push(setInterval(() => this.processSyncQueue().catch(() => undefined), 5 * 60_000));
  }

  onModuleDestroy() {
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
  }

  private initializeMonitoring() {
    // Initialize health check components
    const components = ['database', 'cache', 'api', 'sync'];
    components.forEach(component => {
      this.healthChecks.set(component, {
        component,
        status: 'healthy',
        responseTime: 0,
        lastChecked: new Date(),
        consecutiveFailures: 0,
      });
    });
  }

  /**
   * Continuous health monitoring (runs every minute)
   */
  async performHealthChecks(): Promise<void> {
    this.logger.debug('Performing scheduled health checks');

    // Check integration health
    await this.checkIntegrationHealth();

    // Check data sync health
    await this.checkDataSyncHealth();

    // Check system metrics
    await this.collectSystemMetrics();

    // Evaluate alerts
    await this.evaluateAlerts();
  }

  /**
   * Deep integrity check (runs every hour)
   */
  async performIntegrityCheck(): Promise<void> {
    this.logger.log('Performing scheduled integrity check');

    const report = await this.dataSyncService.checkDataIntegrity();
    
    if (report.issues.length > 0) {
      this.logger.warn(`Found ${report.issues.length} integrity issues`);
      
      // Auto-fix if enabled
      const fixed = await this.dataSyncService.autoFixIntegrityIssues(report);
      
      if (fixed.fixedCount > 0) {
        this.logger.log(`Auto-fixed ${fixed.fixedCount} issues`);
      }
      
      if (fixed.pendingCount > 0) {
        await this.createAlert('integrity', `${fixed.pendingCount} unresolved integrity issues`, 'warning');
      }
    }
  }

  /**
   * Process sync queue (runs every 5 minutes)
   */
  async processSyncQueue(): Promise<void> {
    this.logger.debug('Processing sync queue');
    await this.dataSyncService.processSyncQueue();
  }

  /**
   * Check integration health
   */
  private async checkIntegrationHealth(): Promise<void> {
    const start = Date.now();
    
    try {
      const result = await this.integrationService.verifySystemIntegration();
      const responseTime = Date.now() - start;
      
      this.updateHealthCheck('database', {
        status: result.details.database?.status === 'connected' ? 'healthy' : 'unhealthy',
        responseTime,
        details: result.details.database,
      });

      this.updateHealthCheck('cache', {
        status: result.details.cache?.status === 'operational' ? 'healthy' : 'unhealthy',
        responseTime,
        details: result.details.cache,
      });

      // Record metrics
      this.recordMetric('integration.verification.time', responseTime, 'ms');
      this.recordMetric('integration.success.rate', result.success ? 1 : 0, 'ratio');
    } catch (error) {
      this.logger.error('Integration health check failed', error);
      this.updateHealthCheck('database', { status: 'unhealthy', responseTime: Date.now() - start });
    }
  }

  /**
   * Check data sync health
   */
  private async checkDataSyncHealth(): Promise<void> {
    const queueStatus = await this.dataSyncService.getSyncQueueStatus();
    
    this.updateHealthCheck('sync', {
      status: queueStatus.pending > 100 ? 'degraded' : 'healthy',
      responseTime: 0,
      details: queueStatus,
    });

    this.recordMetric('sync.queue.pending', queueStatus.pending, 'count');
    this.recordMetric('sync.queue.processing', queueStatus.processing, 'count');
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    const memUsage = process.memoryUsage();
    
    this.recordMetric('system.memory.heap.used', memUsage.heapUsed / 1024 / 1024, 'MB');
    this.recordMetric('system.memory.heap.total', memUsage.heapTotal / 1024 / 1024, 'MB');
    this.recordMetric('system.memory.rss', memUsage.rss / 1024 / 1024, 'MB');
    
    const cpuUsage = process.cpuUsage();
    this.recordMetric('system.cpu.user', cpuUsage.user / 1000, 'ms');
    this.recordMetric('system.cpu.system', cpuUsage.system / 1000, 'ms');
  }

  /**
   * Update health check result
   */
  private updateHealthCheck(component: string, update: Partial<HealthCheckResult>): void {
    const current = this.healthChecks.get(component);
    if (!current) return;

    const updated = {
      ...current,
      ...update,
      lastChecked: new Date(),
    };

    if (update.status === 'unhealthy') {
      updated.consecutiveFailures = current.consecutiveFailures + 1;
    } else {
      updated.consecutiveFailures = 0;
    }

    this.healthChecks.set(component, updated);
  }

  /**
   * Record monitoring metric
   */
  private recordMetric(name: string, value: number, unit: string): void {
    const metric: MonitoringMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      status: 'normal',
    };

    // Apply thresholds if configured
    if (name.includes('responseTime') && value > this.alertThresholds.responseTime.critical) {
      metric.status = 'critical';
    } else if (name.includes('responseTime') && value > this.alertThresholds.responseTime.warning) {
      metric.status = 'warning';
    }

    const metricHistory = this.metrics.get(name) ?? [];
    metricHistory.push(metric);
    // Keep only last 100 metrics per name
    if (metricHistory.length > 100) {
      metricHistory.shift();
    }
    this.metrics.set(name, metricHistory);
  }

  /**
   * Evaluate alerts based on metrics and health checks
   */
  private async evaluateAlerts(): Promise<void> {
    // Check for unhealthy components
    for (const [component, health] of this.healthChecks.entries()) {
      if (health.status === 'unhealthy' && health.consecutiveFailures >= 3) {
        await this.createAlert(
          component,
          `${component} has been unhealthy for ${health.consecutiveFailures} consecutive checks`,
          'critical',
        );
      }
    }

    // Check for high response times
    const responseMetrics = this.getMetricsByPattern('responseTime');
    for (const [name, metrics] of responseMetrics) {
      const recent = metrics.slice(-5);
      const avgResponseTime = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      
      if (avgResponseTime > this.alertThresholds.responseTime.critical) {
        await this.createAlert(
          name,
          `High response time: ${avgResponseTime.toFixed(0)}ms`,
          'critical',
        );
      }
    }
  }

  /**
   * Create alert
   */
  private async createAlert(source: string, message: string, severity: 'info' | 'warning' | 'critical'): Promise<void> {
    this.logger[severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'log'](
      `Alert [${severity}] from ${source}: ${message}`,
    );
    await this.auditService.create({
      action: 'monitoring_alert',
      details: {
        source,
        message,
        severity,
        timestamp: new Date(),
      },
    }, 'system', 'System Monitoring');
  }

  /**
   * Record performance benchmark
   */
  recordBenchmark(operation: string, duration: number): void {
    const samples = this.benchmarks.get(operation) ?? [];
    samples.push(duration);
    // Keep only last 1000 samples
    if (samples.length > 1000) {
      samples.shift();
    }
    this.benchmarks.set(operation, samples);
  }

  /**
   * Calculate performance statistics
   */
  getPerformanceStats(operation: string): PerformanceBenchmark | null {
    const samples = this.benchmarks.get(operation);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      operation,
      averageTime: sum / sorted.length,
      minTime: sorted[0]!,
      maxTime: sorted[sorted.length - 1]!,
      p50: this.percentile(sorted, 50),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      sampleSize: sorted.length,
      timestamp: new Date(),
    };
  }

  /**
   * Get all performance benchmarks
   */
  getAllBenchmarks(): PerformanceBenchmark[] {
    const benchmarks: PerformanceBenchmark[] = [];
    
    for (const [operation] of this.benchmarks.entries()) {
      const stats = this.getPerformanceStats(operation);
      if (stats) {
        benchmarks.push(stats);
      }
    }

    return benchmarks;
  }

  /**
   * Get monitoring dashboard data
   */
  getMonitoringDashboard(): {
    health: HealthCheckResult[];
    metrics: { [key: string]: MonitoringMetric[] };
    benchmarks: PerformanceBenchmark[];
    alerts: any[];
  } {
    return {
      health: Array.from(this.healthChecks.values()),
      metrics: Object.fromEntries(this.metrics),
      benchmarks: this.getAllBenchmarks(),
      alerts: [], // Would be populated from a persistent store
    };
  }

  /**
   * Get metrics by pattern
   */
  private getMetricsByPattern(pattern: string): Map<string, MonitoringMetric[]> {
    const matching = new Map<string, MonitoringMetric[]>();
    
    for (const [name, metrics] of this.metrics.entries()) {
      if (name.includes(pattern)) {
        matching.set(name, metrics);
      }
    }

    return matching;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)]!;
  }
}
