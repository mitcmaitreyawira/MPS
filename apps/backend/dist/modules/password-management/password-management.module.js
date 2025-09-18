"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordManagementModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const password_management_controller_1 = require("./password-management.controller");
const password_management_service_1 = require("./password-management.service");
const password_policy_config_1 = require("../../common/config/password-policy.config");
const user_schema_1 = require("../../database/schemas/user.schema");
const audit_service_1 = require("../../common/services/audit.service");
let PasswordManagementModule = class PasswordManagementModule {
};
exports.PasswordManagementModule = PasswordManagementModule;
exports.PasswordManagementModule = PasswordManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
            config_1.ConfigModule,
            jwt_1.JwtModule.register({}),
        ],
        controllers: [password_management_controller_1.PasswordManagementController],
        providers: [
            password_management_service_1.PasswordManagementService,
            password_policy_config_1.PasswordPolicyConfig,
            audit_service_1.AuditService,
        ],
        exports: [password_management_service_1.PasswordManagementService, password_policy_config_1.PasswordPolicyConfig],
    })
], PasswordManagementModule);
//# sourceMappingURL=password-management.module.js.map