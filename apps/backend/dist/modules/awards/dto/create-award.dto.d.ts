import { AwardTier } from '../entities/award.entity';
export declare class CreateAwardDto {
    name: string;
    description: string;
    tier: AwardTier;
    recipientId?: string;
    reason: string;
    icon?: string;
    academicYear?: string;
    metadata?: Record<string, any>;
    isTemplate?: boolean;
    templateName?: string;
}
//# sourceMappingURL=create-award.dto.d.ts.map