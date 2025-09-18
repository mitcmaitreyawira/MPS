import { BadgeTier } from '../entities/quest.entity';
export declare class QueryQuestsDto {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    supervisorId?: string;
    badgeTier?: BadgeTier;
    academicYear?: string;
    minPoints?: number;
    maxPoints?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeExpired?: boolean;
}
//# sourceMappingURL=query-quests.dto.d.ts.map