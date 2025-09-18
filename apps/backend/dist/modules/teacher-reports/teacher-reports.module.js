"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherReportsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const teacher_reports_service_1 = require("./teacher-reports.service");
const teacher_reports_controller_1 = require("./teacher-reports.controller");
const common_module_1 = require("../../common/common.module");
let TeacherReportsModule = class TeacherReportsModule {
};
exports.TeacherReportsModule = TeacherReportsModule;
exports.TeacherReportsModule = TeacherReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule, common_module_1.CommonModule],
        controllers: [teacher_reports_controller_1.TeacherReportsController],
        providers: [teacher_reports_service_1.TeacherReportsService],
        exports: [teacher_reports_service_1.TeacherReportsService]
    })
], TeacherReportsModule);
//# sourceMappingURL=teacher-reports.module.js.map