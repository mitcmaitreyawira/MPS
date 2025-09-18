"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppealsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const appeals_service_1 = require("./appeals.service");
const appeals_controller_1 = require("./appeals.controller");
const common_module_1 = require("../../common/common.module");
const appeal_schema_1 = require("../../database/schemas/appeal.schema");
let AppealsModule = class AppealsModule {
};
exports.AppealsModule = AppealsModule;
exports.AppealsModule = AppealsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: appeal_schema_1.Appeal.name, schema: appeal_schema_1.AppealSchema }]),
            jwt_1.JwtModule,
            common_module_1.CommonModule,
        ],
        controllers: [appeals_controller_1.AppealsController],
        providers: [appeals_service_1.AppealsService],
        exports: [appeals_service_1.AppealsService],
    })
], AppealsModule);
//# sourceMappingURL=appeals.module.js.map