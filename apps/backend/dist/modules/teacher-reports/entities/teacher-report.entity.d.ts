export declare enum ReportStatus {
    NEW = "new",
    REVIEWED = "reviewed"
}
export declare class TeacherReport {
    id: string;
    submittedByUserId: string;
    isAnonymous: boolean;
    targetTeacherId: string;
    details: string;
    timestamp: Date;
    status: ReportStatus;
    response?: string;
    reviewedByUserId?: string;
    reviewedAt?: Date;
    academicYear?: string;
}
//# sourceMappingURL=teacher-report.entity.d.ts.map