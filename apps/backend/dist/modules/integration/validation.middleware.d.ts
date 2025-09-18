import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
export interface ValidationRule {
    entity: string;
    schema: Joi.Schema;
    context?: any;
}
export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
    sanitizedData?: any;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
    type: string;
}
export declare class ValidationMiddleware implements NestMiddleware {
    private validationRules;
    constructor();
    private initializeValidationRules;
    use(req: Request, res: Response, next: NextFunction): void;
    validateData(entity: string, data: any): ValidationResult;
    validateBatch(entity: string, items: any[]): ValidationResult;
    validateConsistency(data: any): Promise<ValidationResult>;
    addValidationRule(entity: string, schema: Joi.Schema): void;
    private extractEntityType;
    private isValidReference;
}
export declare class DataTransformer {
    static normalize(data: any, entity: string): any;
    static sanitize(data: any, entity: string): any;
    static transformBatch(items: any[], entity: string): any[];
}
//# sourceMappingURL=validation.middleware.d.ts.map