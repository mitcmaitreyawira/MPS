"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponseFormatterHelper = void 0;
class ErrorResponseFormatterHelper {
    static formatErrorResponse(status, message, error, request, validationErrors) {
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error,
            message,
        };
        if (validationErrors && validationErrors.length > 0) {
            errorResponse.validationErrors = validationErrors;
        }
        return errorResponse;
    }
    static extractRequestContext(request, status) {
        return {
            requestId: request.requestId,
            userId: request.user?.id || request.user?.sub,
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            statusCode: status,
        };
    }
}
exports.ErrorResponseFormatterHelper = ErrorResponseFormatterHelper;
//# sourceMappingURL=error-response-formatter.helper.js.map