import { Document } from 'mongoose';
export type SyncOperationDocument = SyncOperation & Document;
export declare class SyncOperation {
    operationId: string;
    type: 'create' | 'update' | 'delete' | 'reconcile';
    entity: string;
    data: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    retries: number;
    error?: string;
    timestamp: Date;
    lastProcessed?: Date;
    completedAt?: Date;
    maxRetries: number;
    metadata?: {
        priority?: 'low' | 'medium' | 'high';
        source?: string;
        correlationId?: string;
        [key: string]: any;
    };
}
export declare const SyncOperationSchema: import("mongoose").Schema<SyncOperation, import("mongoose").Model<SyncOperation, any, any, any, Document<unknown, any, SyncOperation, any, {}> & SyncOperation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SyncOperation, Document<unknown, {}, import("mongoose").FlatRecord<SyncOperation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SyncOperation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=sync-operation.schema.d.ts.map