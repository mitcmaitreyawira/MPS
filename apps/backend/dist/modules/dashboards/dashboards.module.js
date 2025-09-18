"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const dashboards_controller_1 = require("./dashboards.controller");
const dashboards_service_1 = require("./dashboards.service");
const user_schema_1 = require("../../database/schemas/user.schema");
const common_module_1 = require("../../common/common.module");
const quests_module_1 = require("../quests/quests.module");
const appeals_module_1 = require("../appeals/appeals.module");
const point_logs_module_1 = require("../points/point-logs.module");
const teacher_reports_module_1 = require("../teacher-reports/teacher-reports.module");
const action_presets_module_1 = require("../action-presets/action-presets.module");
const classes_module_1 = require("../classes/classes.module");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
const awards_module_1 = require("../awards/awards.module");
const auth_module_1 = require("../auth/auth.module");
let DashboardsModule = class DashboardsModule {
};
exports.DashboardsModule = DashboardsModule;
exports.DashboardsModule = DashboardsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
            jwt_1.JwtModule,
            auth_module_1.AuthModule,
            common_module_1.CommonModule,
            quests_module_1.QuestsModule,
            appeals_module_1.AppealsModule,
            point_logs_module_1.PointLogsModule,
            teacher_reports_module_1.TeacherReportsModule,
            action_presets_module_1.ActionPresetsModule,
            classes_module_1.ClassesModule,
            audit_logs_module_1.AuditLogsModule,
            awards_module_1.AwardsModule,
        ],
        controllers: [dashboards_controller_1.DashboardsController],
        providers: [dashboards_service_1.DashboardsService],
        exports: [dashboards_service_1.DashboardsService],
    })
], DashboardsModule);
//# sourceMappingURL=dashboards.module.js.map