"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponseService = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
let ErrorResponseService = class ErrorResponseService {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    createValidationErrorResponse(validationErrors, path, requestId) {
        const errors = [];
        const extractErrors = (validationError, parentPath = '') => {
            const fieldPath = parentPath ? `${parentPath}.${validationError.property}` : validationError.property;
            if (validationError.constraints) {
                Object.values(validationError.constraints).forEach(message => {
                    errors.push({
                        field: fieldPath,
                        message,
                        value: validationError.value,
                    });
                });
            }
            if (validationError.children && validationError.children.length > 0) {
                validationError.children.forEach(child => extractErrors(child, fieldPath));
            }
        };
        validationErrors.forEach(error => extractErrors(error));
        return {
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            error: 'Bad Request',
            timestamp: new Date().toISOString(),
            path,
            errors,
            requestId,
        };
    }
    createDuplicateResourceError(resource, field, value, path, requestId) {
        return {
            statusCode: common_1.HttpStatus.CONFLICT,
            message: `${resource} with this ${field} already exists`,
            error: 'Conflict',
            timestamp: new Date().toISOString(),
            path,
            errors: [{
                    field,
                    message: `This ${field} is already registered`,
                    value,
                }],
            requestId,
        };
    }
    createNotFoundError(resource, identifier, path, requestId) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        return {
            statusCode: common_1.HttpStatus.NOT_FOUND,
            message,
            error: 'Not Found',
            timestamp: new Date().toISOString(),
            path,
            requestId,
        };
    }
    createUnauthorizedError(message = 'Unauthorized access', path, requestId) {
        return {
            statusCode: common_1.HttpStatus.UNAUTHORIZED,
            message,
            error: 'Unauthorized',
            timestamp: new Date().toISOString(),
            path,
            requestId,
        };
    }
    createForbiddenError(message = 'Insufficient permissions', path, requestId) {
        return {
            statusCode: common_1.HttpStatus.FORBIDDEN,
            message,
            error: 'Forbidden',
            timestamp: new Date().toISOString(),
            path,
            requestId,
        };
    }
    createRateLimitError(retryAfter, message = 'Too many requests', path, requestId) {
        return {
            statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
            message,
            error: 'Too Many Requests',
            timestamp: new Date().toISOString(),
            path,
            requestId,
            ...{ retryAfter },
        };
    }
    createInternalServerError(message = 'Internal server error', path, requestId, includeStack = false, stack) {
        const response = {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message,
            error: 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path,
            requestId,
        };
        if (includeStack && stack) {
            response.stack = stack;
        }
        return response;
    }
    createMongoDbDuplicateKeyError(error, path, requestId) {
        const keyPattern = error.keyPattern || {};
        const keyValue = error.keyValue || {};
        const field = Object.keys(keyPattern)[0] || 'field';
        const value = keyValue[field];
        let message = 'Duplicate entry detected';
        let fieldMessage = 'This value is already in use';
        switch (field) {
            case 'email':
                message = 'Email address already registered';
                fieldMessage = 'This email address is already registered';
                break;
            case 'username':
                message = 'Username already taken';
                fieldMessage = 'This username is already taken';
                break;
            case 'nisn':
                message = 'NISN already registered';
                fieldMessage = 'This NISN is already registered';
                break;
        }
        return {
            statusCode: common_1.HttpStatus.CONFLICT,
            message,
            error: 'Conflict',
            timestamp: new Date().toISOString(),
            path,
            errors: [{
                    field,
                    message: fieldMessage,
                    value,
                }],
            requestId,
        };
    }
    logError(error, context, requestId, userId) {
        const logContext = {
            requestId,
            userId,
            metadata: { context },
        };
        if (error instanceof common_1.HttpException) {
            const status = error.getStatus();
            if (status >= 500) {
                this.logger.error(`HTTP Exception (5xx): ${error.message}`, error.stack, logContext);
            }
            else if (status >= 400) {
                this.logger.warn(`HTTP Exception (4xx): ${error.message}`, logContext);
            }
        }
        else {
            this.logger.error(`Unhandled Exception: ${error.message}`, error.stack, logContext);
        }
    }
    createErrorResponse(error, path, requestId, includeStack = false) {
        if (error instanceof common_1.HttpException) {
            const status = error.getStatus();
            const response = error.getResponse();
            if (typeof response === 'object' && response !== null) {
                return {
                    ...response,
                    timestamp: new Date().toISOString(),
                    path,
                    requestId,
                };
            }
            return {
                statusCode: status,
                message: error.message,
                error: error.name,
                timestamp: new Date().toISOString(),
                path,
                requestId,
            };
        }
        if (error.code === 11000) {
            return this.createMongoDbDuplicateKeyError(error, path, requestId);
        }
        return this.createInternalServerError(error.message, path, requestId, includeStack, error.stack);
    }
};
exports.ErrorResponseService = ErrorResponseService;
exports.ErrorResponseService = ErrorResponseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.StructuredLoggerService])
], ErrorResponseService);
//# sourceMappingURL=error-response.service.js.map