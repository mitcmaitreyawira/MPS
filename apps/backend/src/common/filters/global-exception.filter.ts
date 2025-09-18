import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../services/logger.service';
import { ExceptionParserHelper } from './helpers/exception-parser.helper';
import { ErrorResponseFormatterHelper } from './helpers/error-response-formatter.helper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Parse exception using helper
    const { status, message, error, validationErrors } = ExceptionParserHelper.parseException(exception);

    // Extract request context for logging using helper
    const logContext = ErrorResponseFormatterHelper.extractRequestContext(request, status);

    // Log the error with structured logging
    this.logger.logError(
      exception instanceof Error ? exception : new Error(String(exception)),
      logContext
    );

    // Format error response using helper
    const errorResponse = ErrorResponseFormatterHelper.formatErrorResponse(
      status,
      message,
      error,
      request,
      validationErrors
    );

    response.status(status).json(errorResponse);
  }
}