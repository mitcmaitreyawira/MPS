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
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const logger_service_1 = require("../services/logger.service");
let LoggingInterceptor = class LoggingInterceptor {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const requestId = (0, uuid_1.v4)();
        const userId = request.user?.id || request.user?.sub;
        request.requestId = requestId;
        const now = Date.now();
        const logContext = {
            requestId,
            userId,
            method,
            url,
            ip,
            userAgent,
        };
        this.logger.logRequest(logContext);
        return next.handle().pipe((0, operators_1.tap)(() => {
            const responseTime = Date.now() - now;
            this.logger.logResponse({
                ...logContext,
                statusCode: response.statusCode,
                responseTime,
            });
        }), (0, operators_1.catchError)((error) => {
            const responseTime = Date.now() - now;
            this.logger.logError(error, {
                ...logContext,
                statusCode: response.statusCode || 500,
                responseTime,
            });
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.StructuredLoggerService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map