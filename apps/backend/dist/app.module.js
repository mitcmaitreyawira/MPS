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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const core_1 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const health_module_1 = require("./modules/health/health.module");
const quests_module_1 = require("./modules/quests/quests.module");
const appeals_module_1 = require("./modules/appeals/appeals.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const classes_module_1 = require("./modules/classes/classes.module");
const action_presets_module_1 = require("./modules/action-presets/action-presets.module");
const teacher_reports_module_1 = require("./modules/teacher-reports/teacher-reports.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const password_management_module_1 = require("./modules/password-management/password-management.module");
const dashboards_module_1 = require("./modules/dashboards/dashboards.module");
const data_module_1 = require("./modules/data/data.module");
const integration_module_1 = require("./modules/integration/integration.module");
const point_logs_module_1 = require("./modules/points/point-logs.module");
const logger_service_1 = require("./common/services/logger.service");
const ephemeral_collections_service_1 = require("./common/services/ephemeral-collections.service");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: ['.env.local', '.env', '../../.env'],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    uri: config.get('database.uri'),
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: 50,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 10000,
                }),
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    ttl: Number(config.get('cache.ttl') ?? 300) * 1000,
                    max: 500,
                }),
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            ttl: Number(config.get('throttle.ttl') ?? 60),
                            limit: Number(config.get('throttle.limit') ?? 100),
                        },
                    ],
                }),
            }),
            nest_winston_1.WinstonModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    level: config.get('LOG_LEVEL') || 'info',
                    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
                    transports: [
                        new winston.transports.Console({
                            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                        }),
                        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                        new winston.transports.File({ filename: 'logs/combined.log' }),
                    ],
                }),
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            health_module_1.HealthModule,
            classes_module_1.ClassesModule,
            action_presets_module_1.ActionPresetsModule,
            notifications_module_1.NotificationsModule,
            audit_logs_module_1.AuditLogsModule,
            quests_module_1.QuestsModule,
            appeals_module_1.AppealsModule,
            teacher_reports_module_1.TeacherReportsModule,
            password_management_module_1.PasswordManagementModule,
            data_module_1.DataModule,
            dashboards_module_1.DashboardsModule,
            integration_module_1.IntegrationModule,
            point_logs_module_1.PointLogsModule,
        ],
        providers: [
            logger_service_1.StructuredLoggerService,
            ephemeral_collections_service_1.EphemeralCollectionsService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.ResponseInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: global_exception_filter_1.GlobalExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map