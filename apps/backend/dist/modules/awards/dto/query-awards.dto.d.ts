import { AwardTier, AwardStatus } from '../entities/award.entity';
export declare class QueryAwardsDto {
    page?: number;
    limit?: number;
    recipientId?: string;
    awardedBy?: string;
    tier?: AwardTier;
    status?: AwardStatus;
    academicYear?: string;
    search?: string;
    isTemplate?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-awards.dto.d.ts.map