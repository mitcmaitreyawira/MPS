import { Request } from 'express';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    create(createAuditLogDto: CreateAuditLogDto, req: Request): Promise<AuditLog>;
    findAll(query: QueryAuditLogsDto): Promise<{
        logs: AuditLog[];
        total: number;
        pagination: any;
    }>;
}
//# sourceMappingURL=audit-logs.controller.d.ts.map