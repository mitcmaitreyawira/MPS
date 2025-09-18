import { BadgeTier } from '../entities/quest.entity';
export declare class CreateQuestDto {
    title: string;
    description: string;
    points: number;
    supervisorId: string;
    requiredPoints: number;
    badgeTier?: BadgeTier;
    badgeReason?: string;
    badgeIcon?: string;
    slotsAvailable?: number;
    expiresAt?: string;
    academicYear?: string;
    isActive?: boolean;
}
//# sourceMappingURL=create-quest.dto.d.ts.map