import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditLogsService {
    private readonly logger;
    private readonly performanceService;
    private auditLogs;
    private idCounter;
    constructor(logger: StructuredLoggerService, performanceService: PerformanceService);
    create(createAuditLogDto: CreateAuditLogDto, userId: string, userName: string): Promise<AuditLog>;
    findAll(query: QueryAuditLogsDto): Promise<{
        logs: AuditLog[];
        total: number;
        pagination: any;
    }>;
}
//# sourceMappingURL=audit-logs.service.d.ts.map