import { Document, Types } from 'mongoose';
import { PointType, BadgeTier } from '../../modules/points/entities/point-log.entity';
export type PointLogDocument = PointLog & Document;
export declare class PointLog {
    studentId: string;
    points: number;
    type: PointType;
    category: string;
    description: string;
    timestamp: Date;
    addedBy: string;
    badge?: {
        id: string;
        tier: BadgeTier;
        reason: string;
        awardedBy: string;
        awardedOn: Date;
        icon?: string;
    };
    academicYear?: string;
}
export declare const PointLogSchema: import("mongoose").Schema<PointLog, import("mongoose").Model<PointLog, any, any, any, Document<unknown, any, PointLog, any, {}> & PointLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PointLog, Document<unknown, {}, import("mongoose").FlatRecord<PointLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PointLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=point-log.schema.d.ts.map