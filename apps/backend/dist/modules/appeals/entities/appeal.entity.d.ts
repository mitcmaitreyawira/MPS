export declare enum AppealStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Appeal {
    id: string;
    pointLogId: string;
    studentId: string;
    reason: string;
    status: AppealStatus;
    submittedAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    academicYear?: string;
}
//# sourceMappingURL=appeal.entity.d.ts.map