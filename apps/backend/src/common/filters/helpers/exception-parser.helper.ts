import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Helper class for parsing different types of exceptions and determining
 * appropriate HTTP status codes and error messages.
 * Follows the Single Responsibility Principle by focusing solely on exception parsing.
 */
export class ExceptionParserHelper {
  /**
   * Parse an exception and extract status, message, and error type.
   * 
   * @param exception - The exception to parse
   * @returns Parsed exception information
   */
  static parseException(exception: unknown): {
    status: number;
    message: string;
    error: string;
    validationErrors?: string[];
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let validationErrors: string[] | undefined;

    if (exception instanceof HttpException) {
      const httpExceptionData = this.parseHttpException(exception);
      status = httpExceptionData.status;
      message = httpExceptionData.message;
      error = httpExceptionData.error;
      validationErrors = httpExceptionData.validationErrors;
    } else if (this.isMongoError(exception)) {
      const mongoExceptionData = this.parseMongoError(exception);
      status = mongoExceptionData.status;
      message = mongoExceptionData.message;
      error = mongoExceptionData.error;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    return {
      status,
      message,
      error,
      validationErrors,
    };
  }

  /**
   * Parse HTTP exceptions and extract relevant information.
   * 
   * @param exception - The HTTP exception to parse
   * @returns Parsed HTTP exception data
   */
  private static parseHttpException(exception: HttpException): {
    status: number;
    message: string;
    error: string;
    validationErrors?: string[];
  } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let validationErrors: string[] | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || responseObj.error || message;
      error = responseObj.error || error;
      
      // Extract validation errors for bad request responses
      if (status === HttpStatus.BAD_REQUEST && responseObj.message && Array.isArray(responseObj.message)) {
        validationErrors = responseObj.message;
      }
    }

    return {
      status,
      message,
      error,
      validationErrors,
    };
  }

  /**
   * Check if an exception is a MongoDB/Mongoose error.
   * 
   * @param exception - The exception to check
   * @returns Whether the exception is a MongoDB error
   */
  private static isMongoError(exception: unknown): exception is { code: number } {
    return (
      exception !== null &&
      typeof exception === 'object' &&
      'code' in exception
    );
  }

  /**
   * Parse MongoDB/Mongoose errors and extract relevant information.
   * 
   * @param exception - The MongoDB exception to parse
   * @returns Parsed MongoDB exception data
   */
  private static parseMongoError(exception: any): {
    status: number;
    message: string;
    error: string;
  } {
    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database operation failed';
    let error = 'Bad Request';

    if (exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry found';
      error = 'Conflict';
    }

    return {
      status,
      message,
      error,
    };
  }
}