import { Document, Types } from 'mongoose';
export type QuestDocument = Quest & Document;
export declare enum BadgeTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold"
}
export declare class Quest {
    title: string;
    description: string;
    points: number;
    createdBy: Types.ObjectId;
    supervisorId: Types.ObjectId;
    requiredPoints: number;
    isActive: boolean;
    badgeTier?: BadgeTier;
    badgeReason?: string;
    badgeIcon?: string;
    slotsAvailable?: number;
    expiresAt?: Date;
    academicYear?: string;
    participantCount: number;
    completionCount: number;
}
export declare const QuestSchema: import("mongoose").Schema<Quest, import("mongoose").Model<Quest, any, any, any, Document<unknown, any, Quest, any, {}> & Quest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Quest, Document<unknown, {}, import("mongoose").FlatRecord<Quest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Quest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=quest.schema.d.ts.map