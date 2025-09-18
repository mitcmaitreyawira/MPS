import { ActionType } from '../../../database/schemas/action-preset.schema';
export declare class QueryActionPresetsDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: ActionType;
    category?: string;
    isArchived?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-action-presets.dto.d.ts.map