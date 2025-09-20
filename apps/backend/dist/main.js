"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const class_validator_1 = require("class-validator");
const drop_username_index_migration_1 = require("./database/migrations/drop-username-index.migration");
const devlock_service_1 = require("./common/services/devlock.service");
async function bootstrap() {
    const tempLogger = new common_1.Logger('BootstrapDebug');
    tempLogger.log('🚀 BOOTSTRAP FUNCTION STARTED');
    try {
        const { ConfigService } = await Promise.resolve().then(() => __importStar(require('@nestjs/config')));
        const configService = new ConfigService();
        const devLockService = new devlock_service_1.DevLockService(configService);
        await devLockService.acquireLock();
        process.on('SIGINT', async () => {
            await devLockService.onModuleDestroy();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await devLockService.onModuleDestroy();
            process.exit(0);
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        tempLogger.error(`❌ DevLock failed: ${errorMessage}`);
        process.exit(1);
    }
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
        if (!process.env.FORCE_HTTPS && !process.env.CORS_ORIGIN?.startsWith('https://')) {
            tempLogger.warn('⚠️  Production warning: HTTPS not enforced. Set FORCE_HTTPS=true for production deployments.');
        }
        tempLogger.log('✅ Production safety checks passed');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    tempLogger.log('✅ NestFactory.create completed');
    const configService = app.get(config_1.ConfigService);
    tempLogger.log('✅ ConfigService obtained');
    const logger = new common_1.Logger('Bootstrap');
    tempLogger.log('✅ Logger created');
    (0, class_validator_1.useContainer)(app.select(app_module_1.AppModule), { fallbackOnErrors: true });
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use((req, res, next) => {
        const method = req.method.toUpperCase();
        const isProd = (configService.get('NODE_ENV') === 'production');
        const urlPath = req.originalUrl || req.url;
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            const existingCsrfCookie = req.cookies?.['csrf_token'];
            if (!existingCsrfCookie) {
                const crypto = require('crypto');
                const csrfToken = crypto.randomBytes(32).toString('hex');
                res.cookie('csrf_token', csrfToken, {
                    httpOnly: false,
                    sameSite: isProd ? 'none' : 'lax',
                    secure: isProd,
                    path: '/',
                });
                if (!isProd) {
                    const logger = new common_1.Logger('CSRF');
                    logger.log(`Set new CSRF token on ${req.method} ${req.originalUrl}: ${csrfToken}`);
                }
            }
            else if (!isProd) {
                const logger = new common_1.Logger('CSRF');
                logger.log(`Existing CSRF cookie present on ${req.method} ${req.originalUrl}: ${existingCsrfCookie}`);
            }
            return next();
        }
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            if (!isProd) {
                const logger = new common_1.Logger('CSRF');
                logger.log(`Skipping CSRF validation for Bearer token on ${req.method} ${req.originalUrl}`);
            }
            return next();
        }
        const csrfCookie = req.cookies?.['csrf_token'];
        const csrfHeader = req.header('X-CSRF-Token');
        if (!isProd) {
            const logger = new common_1.Logger('CSRF');
            logger.log(`Validating CSRF on ${req.method} ${req.originalUrl} -> cookie: ${csrfCookie} | header: ${csrfHeader}`);
        }
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
        }
        return next();
    });
    console.log('✅ CSRF middleware configured successfully');
    console.log('🔧 About to configure CORS...');
    const corsOriginsRaw = configService.get('CORS_ORIGIN');
    console.log('🔧 Got CORS_ORIGIN:', corsOriginsRaw);
    const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://localhost:5184', 'http://localhost:5185', 'http://localhost:5189', 'http://localhost:5191'];
    const allowedOrigins = new Set([
        ...defaultOrigins,
        ...((corsOriginsRaw || '').split(',').map((o) => o.trim()).filter(Boolean)),
    ]);
    const corsCredentials = (configService.get('CORS_CREDENTIALS') ?? 'true') === 'true';
    console.log('=== CORS DEBUG START ===');
    console.log('CORS_ORIGIN env:', corsOriginsRaw);
    console.log('Default origins:', JSON.stringify(defaultOrigins));
    console.log('Allowed origins:', JSON.stringify(Array.from(allowedOrigins)));
    console.log('CORS credentials:', corsCredentials);
    console.log('Is 5176 allowed?', allowedOrigins.has('http://localhost:5176'));
    console.log('=== CORS DEBUG END ===');
    const corsLogger = new common_1.Logger('CORS');
    app.enableCors({
        origin: (origin, callback) => {
            corsLogger.log(`CORS origin check: ${origin} -> allowed: ${!origin || allowedOrigins.has(origin)}`);
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.has(origin))
                return callback(null, true);
            return callback(null, false);
        },
        credentials: corsCredentials,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
        exposedHeaders: ['Content-Length'],
        optionsSuccessStatus: 204,
    });
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
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
    }));
    if (configService.get('ENABLE_SWAGGER', true)) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('MERN + NestJS Template API')
            .setDescription('Professional MERN + NestJS template with enterprise-grade security.\n\n' +
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
            'and detailed error messages for validation failures.')
            .setVersion('1.0')
            .setContact('API Support', 'https://github.com/your-org/mern-nestjs-template', 'support@example.com')
            .setLicense('MIT', 'https://opensource.org/licenses/MIT')
            .addServer('http://localhost:3001/api/v1', 'Development server')
            .addServer('https://api.yourdomain.com/api/v1', 'Production server')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token (for testing purposes only - production uses HttpOnly cookies)',
            in: 'header',
        }, 'JWT-auth')
            .addCookieAuth('access_token', {
            type: 'http',
            in: 'cookie',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token stored in HttpOnly cookie (automatically handled)',
        }, 'access_token')
            .addTag('Authentication', 'User authentication and session management')
            .addTag('Users', 'User management and profile operations')
            .addTag('Health', 'Application health and monitoring endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config, {
            operationIdFactory: (controllerKey, methodKey) => methodKey,
        });
        swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
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
    try {
        const { getConnectionToken } = await Promise.resolve().then(() => __importStar(require('@nestjs/mongoose')));
        const connection = app.get(getConnectionToken());
        const migration = new drop_username_index_migration_1.DropUsernameIndexMigration(connection);
        await migration.run();
    }
    catch (error) {
        logger.warn('Migration execution failed, continuing startup...');
    }
    const port = configService.get('app.port', 3002);
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    if (configService.get('ENABLE_SWAGGER', true)) {
        logger.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map