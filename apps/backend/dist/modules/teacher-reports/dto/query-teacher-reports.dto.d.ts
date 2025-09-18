import { ReportStatus } from '../entities/teacher-report.entity';
export declare class QueryTeacherReportsDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: ReportStatus;
    submittedByUserId?: string;
    targetTeacherId?: string;
    isAnonymous?: boolean;
    academicYear?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-teacher-reports.dto.d.ts.map