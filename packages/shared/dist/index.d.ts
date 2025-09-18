export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: {
        code?: string;
        message?: string;
        details?: unknown;
    };
    timestamp?: string;
    path?: string;
};
export interface TokenPayload {
    sub: string;
    email: string;
    roles: string[];
    permissions?: string[];
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=index.d.ts.map