import { Document, Types } from 'mongoose';
export type ActionPresetDocument = ActionPreset & Document;
export declare enum ActionType {
    REWARD = "reward",
    VIOLATION = "violation",
    MEDAL = "medal"
}
export declare enum BadgeTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold"
}
export declare class ActionPreset {
    type: ActionType;
    name: string;
    category: string;
    description: string;
    points: number;
    badgeTier?: BadgeTier;
    icon?: string;
    isArchived: boolean;
    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ActionPresetSchema: import("mongoose").Schema<ActionPreset, import("mongoose").Model<ActionPreset, any, any, any, Document<unknown, any, ActionPreset, any, {}> & ActionPreset & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ActionPreset, Document<unknown, {}, import("mongoose").FlatRecord<ActionPreset>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ActionPreset> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=action-preset.schema.d.ts.map