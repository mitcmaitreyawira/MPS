export declare enum AwardTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold"
}
export declare enum AwardStatus {
    ACTIVE = "active",
    REVOKED = "revoked",
    PENDING = "pending"
}
export declare class Award {
    id: string;
    name: string;
    description: string;
    tier: AwardTier;
    status: AwardStatus;
    recipientId: string;
    recipientName?: string;
    awardedBy: string;
    awardedByName?: string;
    awardedOn: Date;
    reason: string;
    icon?: string;
    academicYear?: string;
    metadata?: Record<string, any>;
    isTemplate?: boolean;
    templateName?: string;
    pointValue?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const AWARD_POINT_VALUES: {
    gold: number;
    silver: number;
    bronze: number;
};
//# sourceMappingURL=award.entity.d.ts.map