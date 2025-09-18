import { PointType, BadgeTier } from '../entities/point-log.entity';
export declare class QueryPointLogsDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: PointType;
    studentId?: string;
    category?: string;
    addedBy?: string;
    badgeTier?: BadgeTier;
    academicYear?: string;
    minPoints?: number;
    maxPoints?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-point-logs.dto.d.ts.map