import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@template/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    let errors: string[] = [];
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = (exceptionResponse as any).message;
        errors = Array.isArray(messages) ? messages : [messages];
      }
    }

    const errorResponse: ApiResponse<unknown> = {
      success: false,
      error: { message, details: (errors.length ? errors : undefined) },
timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error for internal server errors
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(errorResponse);
  }
}