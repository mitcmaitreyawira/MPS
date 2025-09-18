"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const quests_service_1 = require("./quests.service");
const quest_participants_service_1 = require("./quest-participants.service");
const quests_controller_1 = require("./quests.controller");
const quest_participants_controller_1 = require("./quest-participants.controller");
const common_module_1 = require("../../common/common.module");
const point_logs_module_1 = require("../points/point-logs.module");
const quest_schema_1 = require("../../database/schemas/quest.schema");
const quest_participant_schema_1 = require("../../database/schemas/quest-participant.schema");
let QuestsModule = class QuestsModule {
};
exports.QuestsModule = QuestsModule;
exports.QuestsModule = QuestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule,
            common_module_1.CommonModule,
            point_logs_module_1.PointLogsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: quest_schema_1.Quest.name, schema: quest_schema_1.QuestSchema },
                { name: quest_participant_schema_1.QuestParticipant.name, schema: quest_participant_schema_1.QuestParticipantSchema },
            ]),
        ],
        controllers: [quests_controller_1.QuestsController, quest_participants_controller_1.QuestParticipantsController],
        providers: [quests_service_1.QuestsService, quest_participants_service_1.QuestParticipantsService],
        exports: [quests_service_1.QuestsService, quest_participants_service_1.QuestParticipantsService],
    })
], QuestsModule);
//# sourceMappingURL=quests.module.js.map