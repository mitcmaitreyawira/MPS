import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { PerformanceService } from '../../common/services/performance.service';
import { CacheService } from '../../common/services/cache.service';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { CacheKey, CacheTTL } from '../../common/decorators/cache.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class HealthResponseDto {
  @ApiProperty({ description: 'Application health status', example: 'ok' })
  status!: string;

  @ApiProperty({ description: 'Current timestamp' })
  timestamp?: string;

  @ApiProperty({ description: 'Application uptime in seconds' })
  uptime?: number;
}

class MetricsResponseDto {
  @ApiProperty({ description: 'Current timestamp' })
  timestamp!: string;

  @ApiProperty({ description: 'Performance statistics' })
  performance!: any;

  @ApiProperty({ description: 'Cache statistics' })
  cache!: any;

  @ApiProperty({ description: 'System information' })
  system!: any;
}

class DatabaseHealthResponseDto {
  @ApiProperty({ description: 'Database name' })
  dbName!: string;

  @ApiProperty({ description: 'Database host (without credentials)' })
  host!: string;

  @ApiProperty({ description: 'Database connection status' })
  ok!: boolean;

  @ApiProperty({ description: 'Connection ready state' })
  readyState?: number;

  @ApiProperty({ description: 'Response time in milliseconds' })
  responseTimeMs?: number;
}

/**
 * HealthController provides health check endpoints and performance monitoring.
 * It returns application status, performance metrics, and system information.
 * Ready/readiness probes could be added to integrate with Kubernetes style healthchecks.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly cacheService: CacheService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Check application health status and availability.' })
  @ApiResponse({ status: 200, description: 'Application is healthy', type: HealthResponseDto })
  get(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Get performance metrics and cache statistics
   * @returns Performance and cache metrics
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Get performance metrics', description: 'Retrieve application performance metrics and cache statistics.' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully', type: MetricsResponseDto })
  async getMetrics() {
     const performanceStats = this.performanceService.getMetrics();
     const cacheStats = await this.cacheService.getStats();
    
    return {
      timestamp: new Date().toISOString(),
      performance: performanceStats,
      cache: cacheStats,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
  }

  /**
   * Get detailed system information
   * @returns Detailed system and application information
   */
  @Get('info')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('health-system-info')
  @CacheTTL(60000) // 60 seconds in milliseconds // Cache for 1 minute
  @ApiOperation({ summary: 'Get system information', description: 'Retrieve detailed system and application information.' })
  @ApiResponse({ status: 200, description: 'System information retrieved successfully' })
  getSystemInfo() {
    return {
      timestamp: new Date().toISOString(),
      application: {
        name: 'MPS Launch Backend',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      database: {
        status: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
        // Don't expose actual connection string for security
      },
      cache: {
        enabled: true,
        type: 'in-memory',
      },
    };
  }

  /**
   * Deep health: DB connectivity (ping + readyState), cache stats, and lightweight collection counts.
   * This endpoint is read-only and safe for external monitors. Avoids heavy queries.
   */
  @Get('full')
  @ApiOperation({ summary: 'Deep health check', description: 'Verify database connectivity, cache status, and basic data availability.' })
  @ApiResponse({ status: 200, description: 'Deep health report retrieved successfully' })
  async getFullHealth() {
    const started = Date.now();
    const dbInfo: any = { readyState: this.connection.readyState };
    const db = this.connection.db;

    if (db) {
      try {
        const pingStart = Date.now();
        await db.admin().ping();
        dbInfo.pingMs = Date.now() - pingStart;
      } catch (e) {
        dbInfo.error = e instanceof Error ? e.message : String(e);
      }
    } else {
      dbInfo.error = 'Database not connected';
    }

    // Probe common collections. Missing collections are tolerated.
    const collectionsToCount = [
      'users',
      'classes',
      'quests',
      'actionpresets',
      'teacherreports',
      'appeals',
      'pointlogs',
      'questparticipants',
      'auditlogs',
    ];
    const counts: Record<string, number | { error: string }> = {};
    if (db) {
      for (const name of collectionsToCount) {
        try {
          const exists = await db.listCollections({ name }).hasNext();
          if (!exists) {
            counts[name] = 0;
            continue;
          }
          const c = db.collection(name);
          counts[name] = await c.countDocuments({});
        } catch (err) {
          counts[name] = { error: err instanceof Error ? err.message : String(err) } as any;
        }
      }
    }

    const cacheStats = await this.cacheService.getStats();

    return {
      status: db ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - started,
      database: dbInfo,
      cache: cacheStats,
      counts,
    };
  }

  /**
   * Database health endpoint - returns database connection info without exposing credentials
   * @returns Database connection status and basic info
   */
  @Get('db')
  @ApiOperation({ summary: 'Database health check', description: 'Check database connectivity and return connection info without credentials.' })
  @ApiResponse({ status: 200, description: 'Database health information retrieved successfully', type: DatabaseHealthResponseDto })
  async getDatabaseHealth(): Promise<DatabaseHealthResponseDto> {
    const started = Date.now();
    const db = this.connection.db;
    let responseTimeMs: number | undefined;
    let ok = false;

    // Test database connectivity
     if (db) {
       try {
         const pingStart = Date.now();
         await db.admin().ping();
         responseTimeMs = Date.now() - pingStart;
         ok = true;
       } catch (error) {
         // Database ping failed, but we still want to return info
         responseTimeMs = Date.now() - started;
       }
     }

    // Extract database name and host from connection
    const dbName = db?.databaseName || 'unknown';
    
    // Parse host from MONGODB_URI without exposing credentials
    let host = 'unknown';
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      try {
        // Extract host and port from URI, removing credentials
        const url = new URL(mongoUri);
        host = `${url.hostname}:${url.port || '27017'}`;
      } catch (error) {
        // If URI parsing fails, try to extract from connection
        host = this.connection.host || 'unknown';
      }
    }

    return {
      dbName,
      host,
      ok,
      readyState: this.connection.readyState,
      responseTimeMs,
    };
  }

  /**
   * Data integrity audit (admin-only): checks for orphaned references and duplicates across key collections.
   * Read-only; does not mutate data.
   */
  @Get('integrity')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Data integrity audit', description: 'Detect orphaned references and duplicate entities across collections.' })
  @ApiResponse({ status: 200, description: 'Integrity report generated successfully' })
  async getIntegrityReport() {
    const db = this.connection.db;
    if (!db) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        issues: [
          { type: 'db_unavailable', message: 'Database not connected; cannot run integrity checks' },
        ],
      };
    }

    // Helper to safely get collection, returning undefined if it does not exist
    const getCol = async (name: string) => {
      const exists = await db.listCollections({ name }).hasNext();
      return exists ? db.collection(name) : undefined;
    };

    const usersCol = await getCol('users');
    const classesCol = await getCol('classes');

    const issues: Array<{ type: string; message: string; sample?: any[]; total?: number }> = [];

    // 1) Users with classId referencing missing classes
    if (usersCol && classesCol) {
      const usersWithClass = await usersCol
        .find({ classId: { $exists: true, $ne: null } }, { projection: { _id: 1, classId: 1, email: 1, name: 1 } })
        .toArray();
      const existingDocs = await classesCol.find({}, { projection: { _id: 1 } }).toArray();
      const existingSet = new Set(existingDocs.map((c: any) => c._id.toString()));
      const orphans = usersWithClass.filter((u: any) => !existingSet.has((u.classId || '').toString()));
      if (orphans.length) {
        issues.push({
          type: 'orphan_user_classId',
          message: `Users reference non-existent classes`,
          total: orphans.length,
          sample: orphans.slice(0, 10),
        });
      }
    }

    // 2) Classes with headTeacherId referencing missing users
    if (usersCol && classesCol) {
      const classesWithHead = await classesCol
        .find({ headTeacherId: { $exists: true, $ne: null } }, { projection: { _id: 1, headTeacherId: 1, name: 1 } })
        .toArray();
      const teacherIds = Array.from(
        new Set(classesWithHead.map((c: any) => (c.headTeacherId || '').toString()).filter(Boolean)),
      );
      const allUsers = await usersCol.find({}, { projection: { _id: 1 } }).toArray();
      const existingUserSet = new Set(allUsers.map((u: any) => u._id.toString()));
      const invalid = classesWithHead.filter((c: any) => !existingUserSet.has((c.headTeacherId || '').toString()));
      if (invalid.length) {
        issues.push({
          type: 'invalid_class_headTeacherId',
          message: `Classes reference non-existent head teachers`,
          total: invalid.length,
          sample: invalid.slice(0, 10),
        });
      }
    }

    // 3) Duplicate class names (case-insensitive)
    if (classesCol) {
      const allClasses = await classesCol.find({}, { projection: { _id: 1, name: 1 } }).toArray();
      const map: Record<string, any[]> = {};
      for (const c of allClasses) {
        const key = (c.name || '').toString().trim().toLowerCase();
        map[key] = map[key] || [];
        map[key].push(c);
      }
      const dups = Object.entries(map)
        .filter(([, arr]) => arr.length > 1)
        .map(([key, arr]) => ({ key, items: arr }));
      if (dups.length) {
        issues.push({
          type: 'duplicate_class_names',
          message: 'Multiple classes share the same name (case-insensitive)',
          total: dups.length,
          sample: dups.slice(0, 5),
        });
      }
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      issues,
    };
  }
}