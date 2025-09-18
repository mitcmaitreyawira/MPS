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
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../services/logger.service");
const exception_parser_helper_1 = require("./helpers/exception-parser.helper");
const error_response_formatter_helper_1 = require("./helpers/error-response-formatter.helper");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const { status, message, error, validationErrors } = exception_parser_helper_1.ExceptionParserHelper.parseException(exception);
        const logContext = error_response_formatter_helper_1.ErrorResponseFormatterHelper.extractRequestContext(request, status);
        this.logger.logError(exception instanceof Error ? exception : new Error(String(exception)), logContext);
        const errorResponse = error_response_formatter_helper_1.ErrorResponseFormatterHelper.formatErrorResponse(status, message, error, request, validationErrors);
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.StructuredLoggerService])
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map