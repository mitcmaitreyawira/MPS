export declare enum PointType {
    REWARD = "reward",
    VIOLATION = "violation",
    QUEST = "quest",
    APPEAL_REVERSAL = "appeal_reversal",
    OVERRIDE = "override"
}
export declare enum BadgeTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold"
}
export interface Badge {
    id: string;
    tier: BadgeTier;
    reason: string;
    awardedBy: string;
    awardedOn: Date;
    icon?: string;
}
export declare class PointLog {
    id: string;
    studentId: string;
    points: number;
    type: PointType;
    category: string;
    description: string;
    timestamp: Date;
    addedBy: string;
    badge?: Badge;
    academicYear?: string;
}
//# sourceMappingURL=point-log.entity.d.ts.map