"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const classes_service_1 = require("./classes.service");
const classes_controller_1 = require("./classes.controller");
const class_schema_1 = require("../../database/schemas/class.schema");
const common_module_1 = require("../../common/common.module");
let ClassesModule = class ClassesModule {
};
exports.ClassesModule = ClassesModule;
exports.ClassesModule = ClassesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: class_schema_1.Class.name, schema: class_schema_1.ClassSchema }]),
            common_module_1.CommonModule,
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
        controllers: [classes_controller_1.ClassesController],
        providers: [
            classes_service_1.ClassesService,
        ],
        exports: [classes_service_1.ClassesService],
    })
], ClassesModule);
//# sourceMappingURL=classes.module.js.map