import { Injectable } from '@nestjs/common';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  private auditLogs: AuditLog[] = [];
  private idCounter = 1;

  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly performanceService: PerformanceService,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto, userId: string, userName: string): Promise<AuditLog> {
    const timerId = `audit-log-create-${Date.now()}`;
    this.performanceService.startTimer(timerId, { action: createAuditLogDto.action });

    try {
      const auditLog: AuditLog = {
        id: `log_${this.idCounter++}`,
        action: createAuditLogDto.action,
        userId,
        userName,
        details: createAuditLogDto.details || {},
        timestamp: new Date(),
      };

      this.auditLogs.push(auditLog);

      this.logger.log('Audit log created', {
        userId,
        metadata: {
          auditLogId: auditLog.id,
          action: auditLog.action,
          details: auditLog.details,
        },
      });

      this.performanceService.endTimer(timerId, { auditLogId: auditLog.id });
      return auditLog;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to create audit log', error instanceof Error ? error.stack : String(error), {
        userId,
        metadata: { action: createAuditLogDto.action },
      });
      throw error;
    }
  }

  async findAll(query: QueryAuditLogsDto): Promise<{ logs: AuditLog[], total: number, pagination: any }> {
    const timerId = `audit-logs-query-${Date.now()}`;
    this.performanceService.startTimer(timerId, { query });

    try {
      const { page = 1, limit = 10, action, userId } = query;
      
      let filteredLogs = [...this.auditLogs];

      // Apply filters
      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
      }
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const total = filteredLogs.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const logs = filteredLogs.slice(startIndex, endIndex);

      const result = {
        logs,
        total,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      this.performanceService.endTimer(timerId, { resultCount: logs.length });
      return result;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to retrieve audit logs', error instanceof Error ? error.stack : String(error), {
        metadata: { query },
      });
      throw error;
    }
  }
}