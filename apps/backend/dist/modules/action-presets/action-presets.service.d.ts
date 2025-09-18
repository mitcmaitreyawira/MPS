import { Model } from 'mongoose';
import { ActionPreset } from '../../database/schemas/action-preset.schema';
import { CreateActionPresetDto, UpdateActionPresetDto, QueryActionPresetsDto } from './dto';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';
export declare class ActionPresetsService {
    private actionPresetModel;
    private readonly logger;
    private readonly performanceService;
    constructor(actionPresetModel: Model<ActionPreset>, logger: StructuredLoggerService, performanceService: PerformanceService);
    findAll(query: QueryActionPresetsDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, ActionPreset, {}, {}> & ActionPreset & {
            _id: import("mongoose").Types.ObjectId;
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, ActionPreset, {}, {}> & ActionPreset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    create(createActionPresetDto: CreateActionPresetDto): Promise<import("mongoose").Document<unknown, {}, ActionPreset, {}, {}> & ActionPreset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, updateActionPresetDto: UpdateActionPresetDto): Promise<(import("mongoose").Document<unknown, {}, ActionPreset, {}, {}> & ActionPreset & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=action-presets.service.d.ts.map