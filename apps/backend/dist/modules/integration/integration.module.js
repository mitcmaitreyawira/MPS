"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const integration_service_1 = require("./integration.service");
const data_sync_service_1 = require("./data-sync.service");
const integration_monitor_service_1 = require("./integration-monitor.service");
const integration_controller_1 = require("./integration.controller");
const validation_middleware_1 = require("./validation.middleware");
const user_schema_1 = require("../../database/schemas/user.schema");
const class_schema_1 = require("../../database/schemas/class.schema");
const sync_operation_schema_1 = require("../../database/schemas/sync-operation.schema");
const performance_metric_schema_1 = require("../../database/schemas/performance-metric.schema");
const common_module_1 = require("../../common/common.module");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
const quests_module_1 = require("../quests/quests.module");
const appeals_module_1 = require("../appeals/appeals.module");
const point_logs_module_1 = require("../points/point-logs.module");
let IntegrationModule = class IntegrationModule {
};
exports.IntegrationModule = IntegrationModule;
exports.IntegrationModule = IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: class_schema_1.Class.name, schema: class_schema_1.ClassSchema },
                { name: sync_operation_schema_1.SyncOperation.name, schema: sync_operation_schema_1.SyncOperationSchema },
                { name: performance_metric_schema_1.PerformanceMetric.name, schema: performance_metric_schema_1.PerformanceMetricSchema },
                { name: performance_metric_schema_1.RequestTimer.name, schema: performance_metric_schema_1.RequestTimerSchema },
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    secret: cfg.get('JWT_ACCESS_SECRET') || 'dev_access_secret',
                    signOptions: {
                        expiresIn: cfg.get('JWT_ACCESS_EXPIRES_IN') || '1h',
                    },
                }),
            }),
            common_module_1.CommonModule,
            audit_logs_module_1.AuditLogsModule,
            quests_module_1.QuestsModule,
            appeals_module_1.AppealsModule,
            point_logs_module_1.PointLogsModule,
        ],
        controllers: [integration_controller_1.IntegrationController],
        providers: [
            integration_service_1.IntegrationService,
            data_sync_service_1.DataSyncService,
            integration_monitor_service_1.IntegrationMonitorService,
            validation_middleware_1.ValidationMiddleware,
        ],
        exports: [
            integration_service_1.IntegrationService,
            data_sync_service_1.DataSyncService,
            integration_monitor_service_1.IntegrationMonitorService,
            validation_middleware_1.ValidationMiddleware,
        ],
    })
], IntegrationModule);
//# sourceMappingURL=integration.module.js.map