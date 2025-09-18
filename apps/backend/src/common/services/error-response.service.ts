import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { StructuredLoggerService } from './logger.service';

export interface ErrorField {
  field: string;
  message: string;
  value?: any;
}

export interface StandardErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  errors?: ErrorField[];
  requestId?: string;
}

@Injectable()
export class ErrorResponseService {
  constructor(private logger: StructuredLoggerService) {}

  /**
   * Create a standardized error response for validation errors
   */
  createValidationErrorResponse(
    validationErrors: ValidationError[],
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    const errors: ErrorField[] = [];
    
    const extractErrors = (validationError: ValidationError, parentPath = '') => {
      const fieldPath = parentPath ? `${parentPath}.${validationError.property}` : validationError.property;
      
      if (validationError.constraints) {
        Object.values(validationError.constraints).forEach(message => {
          errors.push({
            field: fieldPath,
            message,
            value: validationError.value,
          });
        });
      }
      
      if (validationError.children && validationError.children.length > 0) {
        validationError.children.forEach(child => extractErrors(child, fieldPath));
      }
    };
    
    validationErrors.forEach(error => extractErrors(error));
    
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
      path,
      errors,
      requestId,
    };
  }

  /**
   * Create a standardized error response for duplicate resource errors
   */
  createDuplicateResourceError(
    resource: string,
    field: string,
    value: any,
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    return {
      statusCode: HttpStatus.CONFLICT,
      message: `${resource} with this ${field} already exists`,
      error: 'Conflict',
      timestamp: new Date().toISOString(),
      path,
      errors: [{
        field,
        message: `This ${field} is already registered`,
        value,
      }],
      requestId,
    };
  }

  /**
   * Create a standardized error response for resource not found errors
   */
  createNotFoundError(
    resource: string,
    identifier?: string,
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'Not Found',
      timestamp: new Date().toISOString(),
      path,
      requestId,
    };
  }

  /**
   * Create a standardized error response for unauthorized access
   */
  createUnauthorizedError(
    message = 'Unauthorized access',
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
      path,
      requestId,
    };
  }

  /**
   * Create a standardized error response for forbidden access
   */
  createForbiddenError(
    message = 'Insufficient permissions',
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message,
      error: 'Forbidden',
      timestamp: new Date().toISOString(),
      path,
      requestId,
    };
  }

  /**
   * Create a standardized error response for rate limiting
   */
  createRateLimitError(
    retryAfter: number,
    message = 'Too many requests',
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    return {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message,
      error: 'Too Many Requests',
      timestamp: new Date().toISOString(),
      path,
      requestId,
      ...{ retryAfter },
    };
  }

  /**
   * Create a standardized error response for internal server errors
   */
  createInternalServerError(
    message = 'Internal server error',
    path?: string,
    requestId?: string,
    includeStack = false,
    stack?: string,
  ): StandardErrorResponse {
    const response: StandardErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path,
      requestId,
    };

    if (includeStack && stack) {
      (response as any).stack = stack;
    }

    return response;
  }

  /**
   * Create a standardized error response from MongoDB duplicate key error
   */
  createMongoDbDuplicateKeyError(
    error: any,
    path?: string,
    requestId?: string,
  ): StandardErrorResponse {
    const keyPattern = error.keyPattern || {};
    const keyValue = error.keyValue || {};
    
    const field = Object.keys(keyPattern)[0] || 'field';
    const value = keyValue[field];
    
    let message = 'Duplicate entry detected';
    let fieldMessage = 'This value is already in use';
    
    // Customize messages based on field
    switch (field) {
      case 'email':
        message = 'Email address already registered';
        fieldMessage = 'This email address is already registered';
        break;
      case 'username':
        message = 'Username already taken';
        fieldMessage = 'This username is already taken';
        break;
      case 'nisn':
        message = 'NISN already registered';
        fieldMessage = 'This NISN is already registered';
        break;
    }
    
    return {
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'Conflict',
      timestamp: new Date().toISOString(),
      path,
      errors: [{
        field,
        message: fieldMessage,
        value,
      }],
      requestId,
    };
  }

  /**
   * Log error with structured logging
   */
  logError(
    error: Error | HttpException,
    context: string,
    requestId?: string,
    userId?: string,
  ): void {
    const logContext = {
      requestId,
      userId,
      metadata: { context },
    };

    if (error instanceof HttpException) {
      const status = error.getStatus();
      if (status >= 500) {
        this.logger.error(`HTTP Exception (5xx): ${error.message}`, error.stack, logContext);
      } else if (status >= 400) {
        this.logger.warn(`HTTP Exception (4xx): ${error.message}`, logContext);
      }
    } else {
      this.logger.error(`Unhandled Exception: ${error.message}`, error.stack, logContext);
    }
  }

  /**
   * Create error response from any exception
   */
  createErrorResponse(
    error: Error | HttpException,
    path?: string,
    requestId?: string,
    includeStack = false,
  ): StandardErrorResponse {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const response = error.getResponse();
      
      if (typeof response === 'object' && response !== null) {
        return {
          ...response as any,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        };
      }
      
      return {
        statusCode: status,
        message: error.message,
        error: error.name,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      };
    }
    
    // Handle MongoDB duplicate key error
    if ((error as any).code === 11000) {
      return this.createMongoDbDuplicateKeyError(error, path, requestId);
    }
    
    return this.createInternalServerError(
      error.message,
      path,
      requestId,
      includeStack,
      error.stack,
    );
  }
}