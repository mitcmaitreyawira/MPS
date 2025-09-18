import { Types } from 'mongoose';
export declare class QueryNotificationsDto {
    page?: number;
    limit?: number;
    userId?: Types.ObjectId;
    isRead?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-notifications.dto.d.ts.map