"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const user_schema_1 = require("../../database/schemas/user.schema");
const audit_log_schema_1 = require("../../database/schemas/audit-log.schema");
const jwt_cookie_guard_1 = require("./jwt-cookie.guard");
const roles_guard_1 = require("./roles.guard");
const users_module_1 = require("../users/users.module");
const password_service_1 = require("./services/password.service");
const audit_service_1 = require("./services/audit.service");
const password_policy_config_1 = __importDefault(require("./config/password-policy.config"));
const password_management_module_1 = require("../password-management/password-management.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(password_policy_config_1.default),
            users_module_1.UsersModule,
            password_management_module_1.PasswordManagementModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
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
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            password_service_1.PasswordService,
            audit_service_1.AuditService,
            jwt_cookie_guard_1.JwtCookieAuthGuard,
            roles_guard_1.RolesGuard,
        ],
        exports: [
            auth_service_1.AuthService,
            password_service_1.PasswordService,
            audit_service_1.AuditService,
            jwt_1.JwtModule,
            jwt_cookie_guard_1.JwtCookieAuthGuard,
            roles_guard_1.RolesGuard,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map