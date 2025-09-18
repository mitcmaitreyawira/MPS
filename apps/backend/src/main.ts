import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { DropUsernameIndexMigration } from './database/migrations/drop-username-index.migration';

async function bootstrap() {
  const tempLogger = new Logger('BootstrapDebug');
  tempLogger.log('🚀 BOOTSTRAP FUNCTION STARTED');
  
  // Production safety rails - validate critical environment variables
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  
  if (isProduction) {
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'CORS_ORIGIN'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      tempLogger.error(`❌ Production startup failed: Missing required environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }
    
    // Validate JWT secrets are strong enough for production
    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (jwtAccessSecret && jwtAccessSecret.length < 32) {
      tempLogger.error('❌ Production startup failed: JWT_ACCESS_SECRET must be at least 32 characters long');
      process.exit(1);
    }
    
    if (jwtRefreshSecret && jwtRefreshSecret.length < 32) {
      tempLogger.error('❌ Production startup failed: JWT_REFRESH_SECRET must be at least 32 characters long');
      process.exit(1);
    }
    
    // Ensure HTTPS is enforced in production
    if (!process.env.FORCE_HTTPS && !process.env.CORS_ORIGIN?.startsWith('https://')) {
      tempLogger.warn('⚠️  Production warning: HTTPS not enforced. Set FORCE_HTTPS=true for production deployments.');
    }
    
    tempLogger.log('✅ Production safety checks passed');
  }
  
  const app = await NestFactory.create(AppModule);
  tempLogger.log('✅ NestFactory.create completed');
  const configService = app.get(ConfigService);
  tempLogger.log('✅ ConfigService obtained');
  const logger = new Logger('Bootstrap');
  tempLogger.log('✅ Logger created');

  // Enable class-validator to use Nest's DI container (for proper metadata resolution)
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Security
  app.use(helmet());
  app.use(compression());
  // Parse cookies so auth tokens can be read from requests
  app.use(cookieParser());

  // Basic CSRF protection using Double Submit Cookie pattern
  // Frontend reads 'csrf_token' cookie and sends it as 'X-CSRF-Token' header
  app.use((req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    const isProd = (configService.get<string>('NODE_ENV') === 'production');
    const urlPath = (req as any).originalUrl || req.url;

    // Set CSRF token cookie on GET requests if not already present
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      const existingCsrfCookie = (req as any).cookies?.['csrf_token'];
      if (!existingCsrfCookie) {
        const crypto = require('crypto');
        const csrfToken = crypto.randomBytes(32).toString('hex');
        res.cookie('csrf_token', csrfToken, {
          httpOnly: false, // must be readable by frontend
          sameSite: isProd ? 'none' : 'lax',
          secure: isProd, // set to true in production with HTTPS
          path: '/',
        });
        if (!isProd) {
          const logger = new Logger('CSRF');
          logger.log(`Set new CSRF token on ${req.method} ${req.originalUrl}: ${csrfToken}`);
        }
      } else if (!isProd) {
        const logger = new Logger('CSRF');
        logger.log(`Existing CSRF cookie present on ${req.method} ${req.originalUrl}: ${existingCsrfCookie}`);
      }
      return next();
    }

    // Skip CSRF validation if Authorization header is present (for API clients)
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      if (!isProd) {
        const logger = new Logger('CSRF');
        logger.log(`Skipping CSRF validation for Bearer token on ${req.method} ${req.originalUrl}`);
      }
      return next();
    }

    // Validate CSRF token for state-changing requests
    const csrfCookie = (req as any).cookies?.['csrf_token'];
    const csrfHeader = req.header('X-CSRF-Token');

    if (!isProd) {
      const logger = new Logger('CSRF');
      logger.log(`Validating CSRF on ${req.method} ${req.originalUrl} -> cookie: ${csrfCookie} | header: ${csrfHeader}`);
    }

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }
    return next();
  });

  console.log('✅ CSRF middleware configured successfully');
  console.log('🔧 About to configure CORS...');
  
  // CORS
  /**
   * Enable CORS with explicit origin check.  The environment variable
   * CORS_ORIGIN may specify a comma‑separated list of allowed origins.  If
   * undefined, default to allowing typical Vite dev ports.  Credentials are
   * enabled so cookies will be sent.  Unknown origins will simply not have
   * CORS headers applied rather than throwing an error.
   */
  const corsOriginsRaw = configService.get<string>('CORS_ORIGIN');
  console.log('🔧 Got CORS_ORIGIN:', corsOriginsRaw);
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://localhost:5184', 'http://localhost:5185', 'http://localhost:5189', 'http://localhost:5191'];
  const allowedOrigins = new Set([
    ...defaultOrigins,
    ...((corsOriginsRaw || '').split(',').map((o) => o.trim()).filter(Boolean)),
  ]);
  const corsCredentials = (configService.get<string>('CORS_CREDENTIALS') ?? 'true') === 'true';
  
  // Debug CORS configuration
  console.log('=== CORS DEBUG START ===');
  console.log('CORS_ORIGIN env:', corsOriginsRaw);
  console.log('Default origins:', JSON.stringify(defaultOrigins));
  console.log('Allowed origins:', JSON.stringify(Array.from(allowedOrigins)));
  console.log('CORS credentials:', corsCredentials);
  console.log('Is 5176 allowed?', allowedOrigins.has('http://localhost:5176'));
  console.log('=== CORS DEBUG END ===');
  
  const corsLogger = new Logger('CORS');
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      corsLogger.log(`CORS origin check: ${origin} -> allowed: ${!origin || allowedOrigins.has(origin)}`);
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: corsCredentials,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Length'],
    optionsSuccessStatus: 204,
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
      skipUndefinedProperties: false,
      skipNullProperties: false,
      skipMissingProperties: true,
    }),
  );

  // Global filters and interceptors are now registered in AppModule

  // Swagger documentation
  if (configService.get<boolean>('ENABLE_SWAGGER', true)) {
    const config = new DocumentBuilder()
      .setTitle('MERN + NestJS Template API')
      .setDescription(
        'Professional MERN + NestJS template with enterprise-grade security.\n\n' +
        '## Features\n' +
        '- **Authentication**: JWT-based authentication with HttpOnly cookies\n' +
        '- **Authorization**: Role-based access control (RBAC)\n' +
        '- **Validation**: Comprehensive input validation and sanitization\n' +
        '- **Security**: Helmet, CORS, rate limiting, and security headers\n' +
        '- **Monitoring**: Structured logging and health checks\n\n' +
        '## Authentication\n' +
        'This API uses JWT tokens stored in HttpOnly cookies for authentication. ' +
        'After successful login, the token is automatically included in subsequent requests.\n\n' +
        '## Error Handling\n' +
        'All endpoints return consistent error responses with appropriate HTTP status codes ' +
        'and detailed error messages for validation failures.'
      )
      .setVersion('1.0')
      .setContact('API Support', 'https://github.com/your-org/mern-nestjs-template', 'support@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer('http://localhost:3001/api/v1', 'Development server')
      .addServer('https://api.yourdomain.com/api/v1', 'Production server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token (for testing purposes only - production uses HttpOnly cookies)',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth(
        'access_token',
        {
          type: 'http',
          in: 'cookie',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token stored in HttpOnly cookie (automatically handled)',
        },
        'access_token'
      )
      .addTag('Authentication', 'User authentication and session management')
      .addTag('Users', 'User management and profile operations')
      .addTag('Health', 'Application health and monitoring endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });
    
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      customSiteTitle: 'MERN + NestJS API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #3b82f6; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
    });
  }

  // Run database migrations
  try {
    const { getConnectionToken } = await import('@nestjs/mongoose');
    const connection = app.get(getConnectionToken());
    const migration = new DropUsernameIndexMigration(connection);
    await migration.run();
  } catch (error) {
    logger.warn('Migration execution failed, continuing startup...');
  }

  const port = configService.get('app.port', 3001);
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  
  if (configService.get<boolean>('ENABLE_SWAGGER', true)) {
    logger.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
  }
}

bootstrap();