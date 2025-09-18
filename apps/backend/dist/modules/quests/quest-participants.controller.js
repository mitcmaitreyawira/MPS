"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestParticipantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const quest_participants_service_1 = require("./quest-participants.service");
const point_logs_service_1 = require("../points/point-logs.service");
const quests_service_1 = require("./quests.service");
const dto_1 = require("./dto");
const quest_participant_entity_1 = require("./entities/quest-participant.entity");
const quest_participant_entity_2 = require("./entities/quest-participant.entity");
const point_log_entity_1 = require("../points/entities/point-log.entity");
let QuestParticipantsController = class QuestParticipantsController {
    questParticipantsService;
    pointLogsService;
    questsService;
    constructor(questParticipantsService, pointLogsService, questsService) {
        this.questParticipantsService = questParticipantsService;
        this.pointLogsService = pointLogsService;
        this.questsService = questsService;
    }
    async joinQuest(questId, joinQuestDto, req) {
        const userPayload = req.user;
        const studentId = userPayload.id;
        await this.questsService.findOne(questId);
        const participant = await this.questParticipantsService.create({
            questId,
            studentId,
        });
        return participant;
    }
    async submitQuest(questId, submitQuestDto, req) {
        const userPayload = req.user;
        const studentId = userPayload.id;
        const participant = await this.questParticipantsService.update(questId, studentId, {
            status: quest_participant_entity_2.QuestCompletionStatus.SUBMITTED_FOR_REVIEW,
        });
        return participant;
    }
    async reviewQuest(questId, reviewQuestDto, req) {
        const { studentId, isApproved, reviewNotes } = reviewQuestDto;
        const userPayload = req.user;
        const reviewerId = userPayload.id;
        const quest = await this.questsService.findOne(questId);
        if (quest.supervisorId !== reviewerId &&
            userPayload.role !== 'admin' &&
            userPayload.role !== 'super_secret_admin') {
            throw new Error('Insufficient permissions to review this quest');
        }
        const updatedParticipant = await this.questParticipantsService.update(questId, studentId, {
            status: isApproved
                ? quest_participant_entity_2.QuestCompletionStatus.COMPLETED
                : quest_participant_entity_2.QuestCompletionStatus.IN_PROGRESS,
            reviewNotes,
        });
        let pointLog = null;
        if (isApproved && quest.points > 0) {
            pointLog = await this.pointLogsService.create({
                studentId: studentId,
                points: quest.points,
                type: point_log_entity_1.PointType.QUEST,
                category: 'Quest Completion',
                description: `Quest completed: ${quest.title}`,
                addedBy: reviewerId,
                badge: quest.badgeTier ? {
                    id: `quest-${questId}-${Date.now()}`,
                    tier: quest.badgeTier,
                    reason: quest.badgeReason || `Completed quest: ${quest.title}`,
                    awardedBy: reviewerId,
                    awardedOn: new Date(),
                    icon: quest.badgeIcon,
                } : undefined,
            });
        }
        return {
            updatedParticipant,
            pointLog,
        };
    }
};
exports.QuestParticipantsController = QuestParticipantsController;
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, roles_decorator_1.Roles)('student'),
    (0, swagger_1.ApiOperation)({ summary: 'Join a quest' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quest ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Successfully joined the quest.',
        type: quest_participant_entity_1.QuestParticipant,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quest not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.JoinQuestDto, Object]),
    __metadata("design:returntype", Promise)
], QuestParticipantsController.prototype, "joinQuest", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)('student'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a quest for review' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quest ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quest submitted for review successfully.',
        type: quest_participant_entity_1.QuestParticipant,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quest or participant not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SubmitQuestDto, Object]),
    __metadata("design:returntype", Promise)
], QuestParticipantsController.prototype, "submitQuest", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Review a quest submission' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quest ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quest reviewed successfully.',
        schema: {
            type: 'object',
            properties: {
                updatedParticipant: {
                    $ref: '#/components/schemas/QuestParticipant',
                },
                pointLog: {
                    oneOf: [
                        { $ref: '#/components/schemas/PointLog' },
                        { type: 'null' },
                    ],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quest or participant not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReviewQuestDto, Object]),
    __metadata("design:returntype", Promise)
], QuestParticipantsController.prototype, "reviewQuest", null);
exports.QuestParticipantsController = QuestParticipantsController = __decorate([
    (0, swagger_1.ApiTags)('quest-participants'),
    (0, common_1.Controller)('quests'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [quest_participants_service_1.QuestParticipantsService,
        point_logs_service_1.PointLogsService,
        quests_service_1.QuestsService])
], QuestParticipantsController);
//# sourceMappingURL=quest-participants.controller.js.map