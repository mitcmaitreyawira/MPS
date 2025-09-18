"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModule = void 0;
const common_1 = require("@nestjs/common");
const data_controller_1 = require("./data.controller");
const users_module_1 = require("../users/users.module");
const point_logs_module_1 = require("../points/point-logs.module");
const action_presets_module_1 = require("../action-presets/action-presets.module");
const auth_module_1 = require("../auth/auth.module");
let DataModule = class DataModule {
};
exports.DataModule = DataModule;
exports.DataModule = DataModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, point_logs_module_1.PointLogsModule, action_presets_module_1.ActionPresetsModule, auth_module_1.AuthModule],
        controllers: [data_controller_1.DataController],
    })
], DataModule);
//# sourceMappingURL=data.module.js.map