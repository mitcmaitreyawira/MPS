import { Document, Types } from 'mongoose';
export type AppealDocument = Appeal & Document;
export declare enum AppealStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Appeal {
    id: string;
    pointLogId: string;
    studentId: string;
    reason: string;
    status: AppealStatus;
    submittedAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    academicYear: string;
}
export declare const AppealSchema: import("mongoose").Schema<Appeal, import("mongoose").Model<Appeal, any, any, any, Document<unknown, any, Appeal, any, {}> & Appeal & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Appeal, Document<unknown, {}, import("mongoose").FlatRecord<Appeal>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Appeal> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=appeal.schema.d.ts.map