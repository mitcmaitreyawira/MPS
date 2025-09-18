import { Types } from 'mongoose';
import { ActionType, BadgeTier } from '../../../database/schemas/action-preset.schema';
export declare class CreateActionPresetDto {
    type: ActionType;
    name: string;
    category: string;
    description: string;
    points: number;
    badgeTier?: BadgeTier;
    icon?: string;
    isArchived?: boolean;
    createdBy: Types.ObjectId;
}
//# sourceMappingURL=create-action-preset.dto.d.ts.map