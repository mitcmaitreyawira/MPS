"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const cache_service_1 = require("./services/cache.service");
const performance_service_1 = require("./services/performance.service");
const logger_service_1 = require("./services/logger.service");
const dev_lock_service_1 = require("./services/dev-lock.service");
const performance_metric_schema_1 = require("../database/schemas/performance-metric.schema");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forFeature([
                { name: performance_metric_schema_1.PerformanceMetric.name, schema: performance_metric_schema_1.PerformanceMetricSchema },
                { name: performance_metric_schema_1.RequestTimer.name, schema: performance_metric_schema_1.RequestTimerSchema },
            ]),
        ],
        providers: [cache_service_1.CacheService, performance_service_1.PerformanceService, logger_service_1.StructuredLoggerService, dev_lock_service_1.DevLockService],
        exports: [cache_service_1.CacheService, performance_service_1.PerformanceService, logger_service_1.StructuredLoggerService, dev_lock_service_1.DevLockService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map