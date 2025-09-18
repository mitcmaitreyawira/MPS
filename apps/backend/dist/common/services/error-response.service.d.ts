import { HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { StructuredLoggerService } from './logger.service';
export interface ErrorField {
    field: string;
    message: string;
    value?: any;
}
export interface StandardErrorResponse {
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path?: string;
    errors?: ErrorField[];
    requestId?: string;
}
export declare class ErrorResponseService {
    private logger;
    constructor(logger: StructuredLoggerService);
    createValidationErrorResponse(validationErrors: ValidationError[], path?: string, requestId?: string): StandardErrorResponse;
    createDuplicateResourceError(resource: string, field: string, value: any, path?: string, requestId?: string): StandardErrorResponse;
    createNotFoundError(resource: string, identifier?: string, path?: string, requestId?: string): StandardErrorResponse;
    createUnauthorizedError(message?: string, path?: string, requestId?: string): StandardErrorResponse;
    createForbiddenError(message?: string, path?: string, requestId?: string): StandardErrorResponse;
    createRateLimitError(retryAfter: number, message?: string, path?: string, requestId?: string): StandardErrorResponse;
    createInternalServerError(message?: string, path?: string, requestId?: string, includeStack?: boolean, stack?: string): StandardErrorResponse;
    createMongoDbDuplicateKeyError(error: any, path?: string, requestId?: string): StandardErrorResponse;
    logError(error: Error | HttpException, context: string, requestId?: string, userId?: string): void;
    createErrorResponse(error: Error | HttpException, path?: string, requestId?: string, includeStack?: boolean): StandardErrorResponse;
}
//# sourceMappingURL=error-response.service.d.ts.map