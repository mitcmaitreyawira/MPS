export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    timestamp: string;
    path: string;
}
export interface ErrorResponse {
    success: false;
    message: string;
    errors?: string[];
    statusCode: number;
    timestamp: string;
    path: string;
}
export type SortOrder = 'asc' | 'desc';
export interface FilterQuery {
    [key: string]: any;
}
export interface SearchQuery extends PaginationQuery {
    search?: string;
    filters?: FilterQuery;
}
//# sourceMappingURL=common.types.d.ts.map