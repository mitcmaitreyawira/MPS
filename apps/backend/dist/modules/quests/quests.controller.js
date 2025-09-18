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
exports.QuestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quests_service_1 = require("./quests.service");
const dto_1 = require("./dto");
const quest_entity_1 = require("./entities/quest.entity");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let QuestsController = class QuestsController {
    questsService;
    constructor(questsService) {
        this.questsService = questsService;
    }
    create(createQuestDto) {
        return this.questsService.create(createQuestDto);
    }
    findAll(query) {
        return this.questsService.findAll(query);
    }
    getStats() {
        return this.questsService.getStats();
    }
    findOne(id) {
        return this.questsService.findOne(id);
    }
    update(id, updateQuestDto) {
        return this.questsService.update(id, updateQuestDto);
    }
    remove(id) {
        return this.questsService.remove(id);
    }
};
exports.QuestsController = QuestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new quest' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The quest has been successfully created.',
        type: quest_entity_1.Quest,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateQuestDto]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quests with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all quests.',
        type: [quest_entity_1.Quest],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryQuestsDto]),
    __metadata("design:returntype", void 0)
], QuestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quest statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return quest statistics.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuestsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a quest by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quest ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return the quest.',
        type: quest_entity_1.Quest,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quest not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a quest' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quest ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The quest has been successfully updated.',
        type: quest_entity_1.Quest,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quest not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateQuestDto]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a quest' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quest ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'The quest has been successfully deleted.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quest not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized access.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "remove", null);
exports.QuestsController = QuestsController = __decorate([
    (0, swagger_1.ApiTags)('quests'),
    (0, common_1.Controller)('quests'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [quests_service_1.QuestsService])
], QuestsController);
//# sourceMappingURL=quests.controller.js.map