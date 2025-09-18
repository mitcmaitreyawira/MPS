import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { StructuredLoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = uuidv4();
    const userId = request.user?.id || request.user?.sub;

    // Add request ID to request for tracking
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

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.logResponse({
          ...logContext,
          statusCode: response.statusCode,
          responseTime,
        });
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.logError(error, {
          ...logContext,
          statusCode: response.statusCode || 500,
          responseTime,
        });
        return throwError(() => error);
      }),
    );
  }
}