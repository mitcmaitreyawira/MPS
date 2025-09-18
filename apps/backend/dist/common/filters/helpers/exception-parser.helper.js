"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionParserHelper = void 0;
const common_1 = require("@nestjs/common");
class ExceptionParserHelper {
    static parseException(exception) {
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let validationErrors;
        if (exception instanceof common_1.HttpException) {
            const httpExceptionData = this.parseHttpException(exception);
            status = httpExceptionData.status;
            message = httpExceptionData.message;
            error = httpExceptionData.error;
            validationErrors = httpExceptionData.validationErrors;
        }
        else if (this.isMongoError(exception)) {
            const mongoExceptionData = this.parseMongoError(exception);
            status = mongoExceptionData.status;
            message = mongoExceptionData.message;
            error = mongoExceptionData.error;
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        return {
            status,
            message,
            error,
            validationErrors,
        };
    }
    static parseHttpException(exception) {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let validationErrors;
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        }
        else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const responseObj = exceptionResponse;
            message = responseObj.message || responseObj.error || message;
            error = responseObj.error || error;
            if (status === common_1.HttpStatus.BAD_REQUEST && responseObj.message && Array.isArray(responseObj.message)) {
                validationErrors = responseObj.message;
            }
        }
        return {
            status,
            message,
            error,
            validationErrors,
        };
    }
    static isMongoError(exception) {
        return (exception !== null &&
            typeof exception === 'object' &&
            'code' in exception);
    }
    static parseMongoError(exception) {
        let status = common_1.HttpStatus.BAD_REQUEST;
        let message = 'Database operation failed';
        let error = 'Bad Request';
        if (exception.code === 11000) {
            status = common_1.HttpStatus.CONFLICT;
            message = 'Duplicate entry found';
            error = 'Conflict';
        }
        return {
            status,
            message,
            error,
        };
    }
}
exports.ExceptionParserHelper = ExceptionParserHelper;
//# sourceMappingURL=exception-parser.helper.js.map