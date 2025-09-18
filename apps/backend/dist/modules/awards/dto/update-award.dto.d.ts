import { AwardTier, AwardStatus } from '../entities/award.entity';
export declare class UpdateAwardDto {
    name?: string;
    description?: string;
    tier?: AwardTier;
    status?: AwardStatus;
    reason?: string;
    icon?: string;
    academicYear?: string;
    metadata?: Record<string, any>;
    isTemplate?: boolean;
    templateName?: string;
}
//# sourceMappingURL=update-award.dto.d.ts.map