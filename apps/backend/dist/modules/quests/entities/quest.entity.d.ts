export declare enum BadgeTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold"
}
export declare class Quest {
    id: string;
    title: string;
    description: string;
    points: number;
    createdBy: string;
    createdAt: Date;
    isActive: boolean;
    supervisorId: string;
    requiredPoints: number;
    badgeTier?: BadgeTier;
    badgeReason?: string;
    badgeIcon?: string;
    slotsAvailable?: number;
    expiresAt?: Date;
    academicYear?: string;
    participantCount?: number;
    completionCount?: number;
}
//# sourceMappingURL=quest.entity.d.ts.map