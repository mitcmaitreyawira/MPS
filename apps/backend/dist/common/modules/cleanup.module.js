"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cleanup_service_1 = require("../services/cleanup.service");
const cleanup_controller_1 = require("../controllers/cleanup.controller");
const performance_metric_schema_1 = require("../../database/schemas/performance-metric.schema");
const sync_operation_schema_1 = require("../../database/schemas/sync-operation.schema");
let CleanupModule = class CleanupModule {
};
exports.CleanupModule = CleanupModule;
exports.CleanupModule = CleanupModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: performance_metric_schema_1.PerformanceMetric.name, schema: performance_metric_schema_1.PerformanceMetricSchema },
                { name: sync_operation_schema_1.SyncOperation.name, schema: sync_operation_schema_1.SyncOperationSchema },
            ]),
        ],
        controllers: [cleanup_controller_1.CleanupController],
        providers: [cleanup_service_1.CleanupService],
        exports: [cleanup_service_1.CleanupService],
    })
], CleanupModule);
//# sourceMappingURL=cleanup.module.js.map