import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
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

/**
 * StructuredLoggerService provides comprehensive logging capabilities with
 * structured output, contextual information, and environment-aware log levels.
 * Implements NestJS LoggerService interface for framework integration.
 */
@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly logLevel: LogLevel[];
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
    this.logLevel = this.isDevelopment 
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['log', 'error', 'warn'];
  }

  /**
   * Log general information messages.
   * 
   * @param message - The log message
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.log('User created successfully', { userId: '123', method: 'POST' });
   * ```
   */
  log(message: string, context?: LogContext) {
    this.writeLog('log', message, context);
  }

  /**
   * Log error messages with optional stack trace.
   * 
   * @param message - The error message
   * @param trace - Optional stack trace string
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.error('Database connection failed', error.stack, { userId: '123' });
   * ```
   */
  error(message: string, trace?: string, context?: LogContext) {
    this.writeLog('error', message, { ...context, trace });
  }

  /**
   * Log warning messages for potentially problematic situations.
   * 
   * @param message - The warning message
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.warn('Rate limit approaching', { userId: '123', requestCount: 95 });
   * ```
   */
  warn(message: string, context?: LogContext) {
    this.writeLog('warn', message, context);
  }

  /**
   * Log debug messages (only in development environment).
   * 
   * @param message - The debug message
   * @param context - Optional contextual information
   * 
   * @example
   * ```typescript
   * logger.debug('Processing user data', { userId: '123', step: 'validation' });
   * ```
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.writeLog('debug', message, context);
    }
  }

  verbose(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.writeLog('verbose', message, context);
    }
  }

  /**
   * Log incoming HTTP requests with contextual information.
   * 
   * @param context - Request context including method, URL, IP, etc.
   * 
   * @example
   * ```typescript
   * logger.logRequest({ method: 'GET', url: '/users', ip: '127.0.0.1' });
   * ```
   */
  logRequest(context: LogContext) {
    const { method, url } = context;
    this.log(`Incoming Request: ${method} ${url}`, {
      ...context,
      type: 'request',
    });
  }

  /**
   * Log HTTP responses with status codes and response times.
   * 
   * @param context - Response context including status code and timing
   * 
   * @example
   * ```typescript
   * logger.logResponse({ statusCode: 200, responseTime: 45, url: '/users' });
   * ```
   */
  logResponse(context: LogContext) {
    const { method, url, statusCode, responseTime } = context;
    this.log(`Outgoing Response: ${method} ${url} - ${statusCode} (${responseTime}ms)`, {
      ...context,
      type: 'response',
    });
  }

  /**
   * Log application errors with full error details and context.
   * 
   * @param error - The error object
   * @param context - Optional additional context
   * 
   * @example
   * ```typescript
   * logger.logError(new Error('Validation failed'), { userId: '123' });
   * ```
   */
  logError(error: Error, context?: LogContext) {
    this.error(`Error: ${error.message}`, error.stack, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      type: 'error',
    });
  }

  /**
   * Log security-related events for monitoring and auditing.
   * 
   * @param event - Description of the security event
   * @param context - Security context information
   * 
   * @example
   * ```typescript
   * logger.logSecurityEvent('Failed login attempt', { ip: '192.168.1.1' });
   * ```
   */
  logSecurityEvent(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      ...context,
      type: 'security',
      severity: 'high',
    });
  }

  /**
   * Log database operations for performance monitoring and debugging.
   * 
   * @param operation - Description of the database operation
   * @param context - Operation context and metadata
   * 
   * @example
   * ```typescript
   * logger.logDatabaseOperation('User query', { query: 'findById', duration: 25 });
   * ```
   */
  logDatabaseOperation(operation: string, context?: LogContext) {
    this.debug(`Database Operation: ${operation}`, {
      ...context,
      type: 'database',
    });
  }

  private writeLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDevelopment) {
      // Pretty print for development
      process.stdout.write(`[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
      if (context && Object.keys(context).length > 0) {
        process.stdout.write(`Context: ${JSON.stringify(context, null, 2)}\n`);
      }
    } else {
      // Structured JSON for production
      process.stdout.write(`${JSON.stringify(logEntry)}\n`);
    }
  }
}