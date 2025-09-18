import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  private validationRules = new Map<string, ValidationRule>();

  constructor() {
    this.initializeValidationRules();
  }

  private initializeValidationRules() {
    // User validation schema
    this.validationRules.set('user', {
      entity: 'user',
      schema: Joi.object({
        email: Joi.string().email().optional().allow(''),
        firstName: Joi.string().min(1).max(50).required(),
        lastName: Joi.string().min(1).max(50).required(),
        roles: Joi.array().items(
          Joi.string().valid('student', 'teacher', 'parent', 'admin')
        ),
        nisn: Joi.string().optional(),
        classId: Joi.string().hex().length(24).optional(),
        isArchived: Joi.boolean().optional(),
      }),
    });

    // Class validation schema
    this.validationRules.set('class', {
      entity: 'class',
      schema: Joi.object({
        name: Joi.string().min(1).max(100).required(),
        headTeacherId: Joi.string().hex().length(24).optional(),
        students: Joi.array().items(Joi.string().hex().length(24)).optional(),
      }),
    });

    // Quest validation schema
    this.validationRules.set('quest', {
      entity: 'quest',
      schema: Joi.object({
        title: Joi.string().min(1).max(200).required(),
        description: Joi.string().min(1).max(2000).required(),
        pointValue: Joi.number().min(0).max(1000).required(),
        category: Joi.string().valid('academic', 'behavior', 'special').required(),
        difficultyLevel: Joi.string().valid('easy', 'medium', 'hard').required(),
        targetClasses: Joi.array().items(Joi.string().hex().length(24)).optional(),
        dueDate: Joi.date().iso().min('now').optional(),
      }),
    });

    // Point log validation schema
    this.validationRules.set('pointLog', {
      entity: 'pointLog',
      schema: Joi.object({
        userId: Joi.string().hex().length(24).required(),
        points: Joi.number().integer().required(),
        category: Joi.string().valid('academic', 'behavior', 'special').required(),
        description: Joi.string().min(1).max(500).required(),
        awardedBy: Joi.string().hex().length(24).required(),
      }),
    });

    // Appeal validation schema
    this.validationRules.set('appeal', {
      entity: 'appeal',
      schema: Joi.object({
        pointLogId: Joi.string().hex().length(24).required(),
        reason: Joi.string().min(10).max(1000).required(),
        status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
      }),
    });

    // Integration sync validation schema
    this.validationRules.set('syncOperation', {
      entity: 'syncOperation',
      schema: Joi.object({
        type: Joi.string().valid('create', 'update', 'delete', 'reconcile').required(),
        entity: Joi.string().required(),
        data: Joi.object().required(),
        priority: Joi.string().valid('low', 'normal', 'high', 'critical').optional(),
      }),
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip validation for GET requests and health checks
    if (req.method === 'GET' || req.path.includes('/health')) {
      return next();
    }

    // Extract entity type from path
    const entityType = this.extractEntityType(req.path);
    if (!entityType) {
      return next();
    }

    // Validate request body
    const validationResult = this.validateData(entityType, req.body);
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    // Replace body with sanitized data
    req.body = validationResult.sanitizedData;
    next();
  }

  /**
   * Validate data against schema
   */
  validateData(entity: string, data: any): ValidationResult {
    const rule = this.validationRules.get(entity);
    if (!rule) {
      return { valid: true, sanitizedData: data };
    }

    const { error, value } = rule.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
        type: detail.type,
      }));

      return { valid: false, errors };
    }

    return { valid: true, sanitizedData: value };
  }

  /**
   * Validate batch operations
   */
  validateBatch(entity: string, items: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitized: any[] = [];

    items.forEach((item, index) => {
      const result = this.validateData(entity, item);
      if (!result.valid) {
        result.errors?.forEach(error => {
          errors.push({
            ...error,
            field: `[${index}].${error.field}`,
          });
        });
      } else {
        sanitized.push(result.sanitizedData);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      sanitizedData: sanitized,
    };
  }

  /**
   * Validate data consistency across entities
   */
  async validateConsistency(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check for referential integrity
    if (data.userId && !(await this.isValidReference('user', data.userId))) {
      errors.push({
        field: 'userId',
        message: 'Referenced user does not exist',
        value: data.userId,
        type: 'reference.invalid',
      });
    }

    if (data.classId && !(await this.isValidReference('class', data.classId))) {
      errors.push({
        field: 'classId',
        message: 'Referenced class does not exist',
        value: data.classId,
        type: 'reference.invalid',
      });
    }

    // Check for business logic constraints
    if (data.points !== undefined) {
      if (data.points > 1000) {
        errors.push({
          field: 'points',
          message: 'Points cannot exceed 1000 in a single transaction',
          value: data.points,
          type: 'business.constraint',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      sanitizedData: data,
    };
  }

  /**
   * Custom validation rules
   */
  addValidationRule(entity: string, schema: Joi.Schema): void {
    this.validationRules.set(entity, { entity, schema });
  }

  /**
   * Extract entity type from request path
   */
  private extractEntityType(path: string): string | null {
    const patterns = {
      '/users': 'user',
      '/classes': 'class',
      '/quests': 'quest',
      '/point-logs': 'pointLog',
      '/appeals': 'appeal',
      '/sync': 'syncOperation',
    };

    for (const [pattern, entity] of Object.entries(patterns)) {
      if (path.includes(pattern)) {
        return entity;
      }
    }

    return null;
  }

  /**
   * Check if reference is valid (placeholder - would query database)
   */
  private async isValidReference(entity: string, id: string): Promise<boolean> {
    // This would normally query the database
    // For now, return true if ID format is valid
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

/**
 * Data transformation utilities
 */
export class DataTransformer {
  /**
   * Normalize data structure
   */
  static normalize(data: any, entity: string): any {
    const normalized = { ...data };

    // Ensure consistent ID field
    if (normalized._id && !normalized.id) {
      normalized.id = normalized._id;
      delete normalized._id;
    }

    // Normalize dates
    const dateFields = ['createdAt', 'updatedAt', 'timestamp', 'dueDate'];
    dateFields.forEach(field => {
      if (normalized[field]) {
        normalized[field] = new Date(normalized[field]).toISOString();
      }
    });

    // Entity-specific normalization
    switch (entity) {
      case 'user':
        // Ensure roles is an array
        if (normalized.role && !normalized.roles) {
          normalized.roles = [normalized.role];
          delete normalized.role;
        }
        break;

      case 'class':
        // Ensure students is an array
        if (!Array.isArray(normalized.students)) {
          normalized.students = [];
        }
        break;
    }

    return normalized;
  }

  /**
   * Sanitize sensitive data
   */
  static sanitize(data: any, entity: string): any {
    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'salt', 'resetToken', '__v'];
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });

    // Entity-specific sanitization
    switch (entity) {
      case 'user':
        // Mask email for non-admin users
        if (sanitized.email && !sanitized.isAdmin) {
          const [local, domain] = sanitized.email.split('@');
          sanitized.email = `${local.substring(0, 2)}***@${domain}`;
        }
        break;
    }

    return sanitized;
  }

  /**
   * Validate and transform batch data
   */
  static transformBatch(items: any[], entity: string): any[] {
    return items.map(item => this.normalize(item, entity));
  }
}
