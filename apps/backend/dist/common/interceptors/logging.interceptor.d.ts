import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StructuredLoggerService } from '../services/logger.service';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    constructor(logger: StructuredLoggerService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
//# sourceMappingURL=logging.interceptor.d.ts.map