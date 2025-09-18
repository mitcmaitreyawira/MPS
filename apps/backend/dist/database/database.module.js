"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("./schemas/user.schema");
const class_schema_1 = require("./schemas/class.schema");
const action_preset_schema_1 = require("./schemas/action-preset.schema");
const notification_schema_1 = require("./schemas/notification.schema");
const award_schema_1 = require("./schemas/award.schema");
const point_log_schema_1 = require("./schemas/point-log.schema");
const quest_schema_1 = require("./schemas/quest.schema");
const quest_participant_schema_1 = require("./schemas/quest-participant.schema");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: class_schema_1.Class.name, schema: class_schema_1.ClassSchema },
                { name: action_preset_schema_1.ActionPreset.name, schema: action_preset_schema_1.ActionPresetSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: award_schema_1.Award.name, schema: award_schema_1.AwardSchema },
                { name: point_log_schema_1.PointLog.name, schema: point_log_schema_1.PointLogSchema },
                { name: quest_schema_1.Quest.name, schema: quest_schema_1.QuestSchema },
                { name: quest_participant_schema_1.QuestParticipant.name, schema: quest_participant_schema_1.QuestParticipantSchema },
            ]),
        ],
        exports: [mongoose_1.MongooseModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map