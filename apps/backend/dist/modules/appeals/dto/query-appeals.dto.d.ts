import { AppealStatus } from '../entities/appeal.entity';
export declare class QueryAppealsDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: AppealStatus;
    studentId?: string;
    reviewedBy?: string;
    academicYear?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-appeals.dto.d.ts.map