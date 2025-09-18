import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CacheService } from '../services/cache.service';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      'rateLimit',
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true; // No rate limiting configured
    }

    const key = this.generateKey(request, rateLimitOptions);
    const current = await this.getCurrentCount(key);
    const isAllowed = current < rateLimitOptions.maxRequests;

    if (isAllowed) {
      await this.incrementCount(key, rateLimitOptions.windowMs);
    }

    if (!isAllowed) {
      const resetTime = await this.getResetTime(key);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitOptions.message || 'Too many requests',
          error: 'Too Many Requests',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', rateLimitOptions.maxRequests);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitOptions.maxRequests - current - 1));
    response.setHeader('X-RateLimit-Reset', Math.ceil((await this.getResetTime(key)) / 1000));

    return true;
  }

  private generateKey(request: Request, options: RateLimitOptions): string {
    const ip = this.getClientIp(request);
    const route = request.route?.path || request.path;
    const method = request.method;
    
    // Include user ID if authenticated for per-user rate limiting
    const userId = (request as any).user?.id || 'anonymous';
    
    return `rate_limit:${method}:${route}:${ip}:${userId}`;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private async getCurrentCount(key: string): Promise<number> {
    const count = await this.cacheService.get<string>(key);
    return count ? parseInt(count, 10) : 0;
  }

  private async incrementCount(key: string, windowMs: number): Promise<void> {
    const current = await this.getCurrentCount(key);
    await this.cacheService.set(key, (current + 1).toString(), windowMs);
  }

  private async getResetTime(key: string): Promise<number> {
    // Since we don't have getTtl, we'll estimate based on window
    return Date.now() + 60000; // Default 1 minute reset time
  }
}

// Decorator for easy use
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', options, descriptor.value);
  };
};