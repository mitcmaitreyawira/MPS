import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { StructuredLoggerService } from '../services/logger.service';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: StructuredLoggerService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
//# sourceMappingURL=global-exception.filter.d.ts.map