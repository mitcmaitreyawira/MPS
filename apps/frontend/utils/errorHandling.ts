import { User } from '../types';

// Enhanced error types for better error categorization
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DUPLICATE = 'duplicate',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface EnhancedError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  field?: string;
  code?: string;
  statusCode?: number;
  timestamp: Date;
  context?: Record<string, any>;
  suggestions?: string[];
  retryable?: boolean;
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: EnhancedError) => void;
  onMaxRetriesReached?: (error: EnhancedError) => void;
}

// Error classification based on HTTP status codes and error messages
export class ErrorClassifier {
  static classifyError(error: any, context?: Record<string, any>): EnhancedError {
    const timestamp = new Date();
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = 'An unexpected error occurred';
    let suggestions: string[] = [];
    let retryable = false;
    let field: string | undefined;
    let code: string | undefined;
    let statusCode: number | undefined;

    // Extract status code from various error formats
    if (error?.response?.status) {
      statusCode = error.response.status;
    } else if (error?.status) {
      statusCode = error.status;
    }

    // Extract error message
    const message = error?.message || error?.response?.data?.message || error?.toString() || 'Unknown error';

    // Classify based on status code
    if (statusCode) {
      switch (statusCode) {
        case 400:
          type = ErrorType.VALIDATION;
          severity = ErrorSeverity.LOW;
          userMessage = 'Please check your input and try again';
          suggestions = ['Verify all required fields are filled', 'Check data format requirements'];
          break;
        case 401:
          type = ErrorType.AUTHENTICATION;
          severity = ErrorSeverity.HIGH;
          userMessage = 'Please log in to continue';
          suggestions = ['Log in with your credentials', 'Contact support if login issues persist'];
          break;
        case 403:
          type = ErrorType.AUTHORIZATION;
          severity = ErrorSeverity.HIGH;
          userMessage = 'You do not have permission to perform this action';
          suggestions = ['Contact an administrator for access', 'Verify your role permissions'];
          break;
        case 404:
          type = ErrorType.NOT_FOUND;
          severity = ErrorSeverity.MEDIUM;
          userMessage = 'The requested resource was not found';
          suggestions = ['Refresh the page', 'Check if the item still exists'];
          break;
        case 409:
          type = ErrorType.DUPLICATE;
          severity = ErrorSeverity.MEDIUM;
          userMessage = 'This information already exists';
          suggestions = ['Use different information', 'Check existing records'];
          retryable = false;
          break;
        case 429:
          type = ErrorType.NETWORK;
          severity = ErrorSeverity.MEDIUM;
          userMessage = 'Too many requests. Please wait and try again';
          suggestions = ['Wait a few moments before retrying'];
          retryable = true;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          type = ErrorType.SERVER;
          severity = ErrorSeverity.HIGH;
          userMessage = 'Server error. Please try again later';
          suggestions = ['Try again in a few minutes', 'Contact support if the issue persists'];
          retryable = true;
          break;
      }
    }

    // Classify based on error message patterns
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'Network connection error';
      suggestions = ['Check your internet connection', 'Try again in a moment'];
      retryable = true;
    } else if ((statusCode === 409 || !statusCode || type === ErrorType.UNKNOWN) && lowerMessage.includes('email') && lowerMessage.includes('already')) {
      // Only infer duplicate by message if status is 409 or unknown/not provided
      type = ErrorType.DUPLICATE;
      field = 'email';
      userMessage = 'This email address is already registered';
      suggestions = ['Use a different email address', 'Check if you already have an account'];
    } else if ((statusCode === 409 || !statusCode || type === ErrorType.UNKNOWN) && lowerMessage.includes('nisn') && lowerMessage.includes('already')) {
      // Only infer duplicate by message if status is 409 or unknown/not provided
      type = ErrorType.DUPLICATE;
      field = 'nisn';
      userMessage = 'This NISN is already registered';
      suggestions = ['Verify the NISN is correct', 'Check if the student already exists'];
    } else if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      userMessage = 'Please check your input';
      suggestions = ['Verify all fields are correctly filled', 'Check format requirements'];
    }

    return {
      type,
      severity,
      message,
      userMessage,
      field,
      code,
      statusCode,
      timestamp,
      context,
      suggestions,
      retryable
    };
  }
}

// Enhanced error handler with retry logic and user feedback
export class ErrorHandler {
  private static errorLog: EnhancedError[] = [];
  private static maxLogSize = 100;

  static async handleError(
    error: any,
    context?: Record<string, any>,
    recoveryOptions?: ErrorRecoveryOptions
  ): Promise<EnhancedError> {
    const enhancedError = ErrorClassifier.classifyError(error, context);
    
    // Log error
    this.logError(enhancedError);
    
    // Attempt recovery if retryable and options provided
    if (enhancedError.retryable && recoveryOptions) {
      return this.attemptRecovery(enhancedError, recoveryOptions);
    }
    
    return enhancedError;
  }

  private static logError(error: EnhancedError): void {
    // Add to in-memory log
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging based on severity
    const logData = {
      type: error.type,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      field: error.field,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      context: error.context
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('[ErrorHandler]', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[ErrorHandler]', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('[ErrorHandler]', logData);
        break;
    }
  }

  private static async attemptRecovery(
    error: EnhancedError,
    options: ErrorRecoveryOptions
  ): Promise<EnhancedError> {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.retryDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const delay = options.exponentialBackoff 
        ? baseDelay * Math.pow(2, attempt - 1)
        : baseDelay;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (options.onRetry) {
        options.onRetry(attempt, error);
      }
      
      // In a real implementation, you would retry the original operation here
      // For now, we just return the error after attempts
    }
    
    if (options.onMaxRetriesReached) {
      options.onMaxRetriesReached(error);
    }
    
    return error;
  }

  static getErrorLog(): EnhancedError[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static getErrorStats(): { [key in ErrorType]: number } {
    const stats = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as { [key in ErrorType]: number });

    this.errorLog.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }
}

// User-friendly error message formatter
export class ErrorMessageFormatter {
  static formatForUser(error: EnhancedError): string {
    let message = `❌ ${error.userMessage}`;
    
    if (error.suggestions && error.suggestions.length > 0) {
      message += '\n\n💡 Suggestions:';
      error.suggestions.forEach(suggestion => {
        message += `\n• ${suggestion}`;
      });
    }
    
    if (error.retryable) {
      message += '\n\n🔄 This operation can be retried.';
    }
    
    return message;
  }

  static formatForDeveloper(error: EnhancedError): string {
    return `[${error.type.toUpperCase()}] ${error.message}\n` +
           `Severity: ${error.severity}\n` +
           `Status: ${error.statusCode || 'N/A'}\n` +
           `Field: ${error.field || 'N/A'}\n` +
           `Timestamp: ${error.timestamp.toISOString()}\n` +
           `Context: ${JSON.stringify(error.context, null, 2)}`;
  }
}

// Validation error helpers
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

export class ValidationErrorHandler {
  static createFieldError(field: string, message: string, value?: any): EnhancedError {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message: `Validation failed for field '${field}': ${message}`,
      userMessage: message,
      field,
      timestamp: new Date(),
      context: { field, value },
      suggestions: ['Please correct the highlighted field and try again'],
      retryable: false
    };
  }

  static createMultiFieldError(errors: ValidationErrorDetail[]): EnhancedError {
    const fieldNames = errors.map(e => e.field).join(', ');
    const messages = errors.map(e => `${e.field}: ${e.message}`).join('; ');
    
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message: `Multiple validation errors: ${messages}`,
      userMessage: `Please correct the following fields: ${fieldNames}`,
      timestamp: new Date(),
      context: { errors },
      suggestions: [
        'Review all highlighted fields',
        'Ensure all required fields are filled',
        'Check format requirements for each field'
      ],
      retryable: false
    };
  }
}

// Network error recovery utilities
export class NetworkErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: ErrorRecoveryOptions = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.retryDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const enhancedError = ErrorClassifier.classifyError(error);
        
        if (!enhancedError.retryable || attempt === maxRetries) {
          throw error;
        }
        
        const delay = options.exponentialBackoff 
          ? baseDelay * Math.pow(2, attempt - 1)
          : baseDelay;
        
        if (options.onRetry) {
          options.onRetry(attempt, enhancedError);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries reached');
  }
}