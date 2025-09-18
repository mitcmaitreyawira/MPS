"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPresetsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const action_presets_service_1 = require("./action-presets.service");
const action_presets_controller_1 = require("./action-presets.controller");
const action_preset_schema_1 = require("../../database/schemas/action-preset.schema");
const common_module_1 = require("../../common/common.module");
let ActionPresetsModule = class ActionPresetsModule {
};
exports.ActionPresetsModule = ActionPresetsModule;
exports.ActionPresetsModule = ActionPresetsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: action_preset_schema_1.ActionPreset.name, schema: action_preset_schema_1.ActionPresetSchema },
            ]),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('jwt.secret'),
                    signOptions: {
                        expiresIn: config.get('jwt.expiresIn'),
                    },
                }),
            }),
            common_module_1.CommonModule,
        ],
        controllers: [action_presets_controller_1.ActionPresetsController],
        providers: [
            action_presets_service_1.ActionPresetsService,
        ],
        exports: [action_presets_service_1.ActionPresetsService],
    })
], ActionPresetsModule);
//# sourceMappingURL=action-presets.module.js.map