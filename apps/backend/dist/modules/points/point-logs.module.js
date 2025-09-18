"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointLogsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const point_logs_service_1 = require("./point-logs.service");
const point_logs_controller_1 = require("./point-logs.controller");
const points_controller_1 = require("./points.controller");
const common_module_1 = require("../../common/common.module");
const database_module_1 = require("../../database/database.module");
let PointLogsModule = class PointLogsModule {
};
exports.PointLogsModule = PointLogsModule;
exports.PointLogsModule = PointLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule, common_module_1.CommonModule, database_module_1.DatabaseModule],
        controllers: [point_logs_controller_1.PointLogsController, points_controller_1.PointsController],
        providers: [point_logs_service_1.PointLogsService],
        exports: [point_logs_service_1.PointLogsService],
    })
], PointLogsModule);
//# sourceMappingURL=point-logs.module.js.map