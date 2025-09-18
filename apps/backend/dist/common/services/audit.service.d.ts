export interface AuditLogEntry {
    action: string;
    userId: string;
    targetUserId?: string;
    details: Record<string, any>;
    timestamp?: Date;
}
export interface AuditLog {
    _id?: string;
    action: string;
    userId: string;
    targetUserId?: string;
    details: Record<string, any>;
    timestamp: Date;
}
export declare class AuditService {
    private readonly logger;
    constructor();
    log(entry: AuditLogEntry): Promise<void>;
    getLogsForUser(userId: string, limit?: number): Promise<AuditLog[]>;
    getLogsByAction(action: string, limit?: number): Promise<AuditLog[]>;
}
//# sourceMappingURL=audit.service.d.ts.map