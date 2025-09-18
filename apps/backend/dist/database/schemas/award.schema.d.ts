import { Document, Types } from 'mongoose';
export type AwardDocument = Award & Document;
export declare enum AwardTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold"
}
export declare enum AwardStatus {
    ACTIVE = "active",
    REVOKED = "revoked",
    PENDING = "pending"
}
export declare class Award {
    name: string;
    description: string;
    tier: AwardTier;
    status: AwardStatus;
    recipientId?: Types.ObjectId;
    awardedBy: Types.ObjectId;
    awardedOn: Date;
    reason: string;
    icon?: string;
    academicYear?: string;
    metadata?: Record<string, any>;
    isTemplate: boolean;
    templateName?: string;
    pointValue?: number;
}
export declare const AwardSchema: import("mongoose").Schema<Award, import("mongoose").Model<Award, any, any, any, Document<unknown, any, Award, any, {}> & Award & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Award, Document<unknown, {}, import("mongoose").FlatRecord<Award>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Award> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=award.schema.d.ts.map