import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';
import { AuditAction } from '../enums/audit-action.enum';
type AuditData = Record<string, any>;
export declare class AuditService {
    private readonly auditModel;
    constructor(auditModel: Model<AuditLogDocument>);
    log(userId: string, action: AuditAction, resource: string, resourceId: string, data?: AuditData): Promise<AuditLog>;
    getLogs(userId?: string, resource?: string, resourceId?: string, action?: AuditAction, limit?: number, skip?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
}
export {};
//# sourceMappingURL=audit.service.d.ts.map