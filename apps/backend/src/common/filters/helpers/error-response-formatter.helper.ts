import { Request } from 'express';

/**
 * Helper class for formatting error responses in a consistent structure.
 * Follows the Single Responsibility Principle by focusing solely on response formatting.
 */
export class ErrorResponseFormatterHelper {
  /**
   * Format an error response with consistent structure.
   * 
   * @param status - HTTP status code
   * @param message - Error message
   * @param error - Error type/name
   * @param request - Express request object
   * @param validationErrors - Optional validation errors array
   * @returns Formatted error response object
   */
  static formatErrorResponse(
    status: number,
    message: string,
    error: string,
    request: Request,
    validationErrors?: string[]
  ): Record<string, any> {
    const errorResponse: Record<string, any> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    // Add validation errors if present
    if (validationErrors && validationErrors.length > 0) {
      errorResponse.validationErrors = validationErrors;
    }

    return errorResponse;
  }

  /**
   * Extract request context information for logging purposes.
   * 
   * @param request - Express request object
   * @param status - HTTP status code
   * @returns Request context object
   */
  static extractRequestContext(
    request: Request,
    status: number
  ): Record<string, any> {
    return {
      requestId: (request as any).requestId,
      userId: (request as any).user?.id || (request as any).user?.sub,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      statusCode: status,
    };
  }
}