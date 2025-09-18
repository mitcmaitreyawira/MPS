import { Document, Types } from 'mongoose';
import { AuditAction } from '../../modules/auth/enums/audit-action.enum';
export type AuditLogDocument = AuditLog & Document;
export declare class AuditLog {
    userId: string;
    action: AuditAction;
    resource: string;
    resourceId: string;
    data: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}
export declare const AuditLogSchema: import("mongoose").Schema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, Document<unknown, any, AuditLog, any, {}> & AuditLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuditLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=audit-log.schema.d.ts.map