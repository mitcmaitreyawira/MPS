import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface LogContext {
    userId?: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    responseTime?: number;
    error?: Error;
    metadata?: Record<string, any>;
    trace?: string;
    type?: string;
    severity?: string;
}
export declare class StructuredLoggerService implements LoggerService {
    private readonly configService;
    private readonly logLevel;
    private readonly isDevelopment;
    constructor(configService: ConfigService);
    log(message: string, context?: LogContext): void;
    error(message: string, trace?: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    verbose(message: string, context?: LogContext): void;
    logRequest(context: LogContext): void;
    logResponse(context: LogContext): void;
    logError(error: Error, context?: LogContext): void;
    logSecurityEvent(event: string, context?: LogContext): void;
    logDatabaseOperation(operation: string, context?: LogContext): void;
    private writeLog;
}
//# sourceMappingURL=logger.service.d.ts.map