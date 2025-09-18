import { Request } from 'express';
export declare class ErrorResponseFormatterHelper {
    static formatErrorResponse(status: number, message: string, error: string, request: Request, validationErrors?: string[]): Record<string, any>;
    static extractRequestContext(request: Request, status: number): Record<string, any>;
}
//# sourceMappingURL=error-response-formatter.helper.d.ts.map