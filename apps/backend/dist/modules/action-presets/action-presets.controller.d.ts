import { ActionPresetsService } from './action-presets.service';
import { CreateActionPresetDto, UpdateActionPresetDto, QueryActionPresetsDto } from './dto';
import { TokenPayload } from '@template/shared';
import { Types } from 'mongoose';
export declare class ActionPresetsController {
    private readonly actionPresetsService;
    constructor(actionPresetsService: ActionPresetsService);
    create(createActionPresetDto: CreateActionPresetDto, user: TokenPayload): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas/action-preset.schema").ActionPreset, {}, {}> & import("../../database/schemas/action-preset.schema").ActionPreset & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(query: QueryActionPresetsDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../../database/schemas/action-preset.schema").ActionPreset, {}, {}> & import("../../database/schemas/action-preset.schema").ActionPreset & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas/action-preset.schema").ActionPreset, {}, {}> & import("../../database/schemas/action-preset.schema").ActionPreset & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, updateActionPresetDto: UpdateActionPresetDto): Promise<(import("mongoose").Document<unknown, {}, import("../../database/schemas/action-preset.schema").ActionPreset, {}, {}> & import("../../database/schemas/action-preset.schema").ActionPreset & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=action-presets.controller.d.ts.map