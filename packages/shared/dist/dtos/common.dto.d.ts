export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class SearchDto extends PaginationDto {
    search?: string;
}
export declare class BulkDeleteDto {
    ids: string[];
}
//# sourceMappingURL=common.dto.d.ts.map