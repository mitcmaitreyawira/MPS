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
exports.QuestsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const quest_entity_1 = require("./entities/quest.entity");
const quest_participant_schema_1 = require("../../database/schemas/quest-participant.schema");
let QuestsService = class QuestsService {
    questModel;
    questParticipantModel;
    constructor(questModel, questParticipantModel) {
        this.questModel = questModel;
        this.questParticipantModel = questParticipantModel;
    }
    async findAll(query) {
        const filter = {};
        if (query.search) {
            filter.$text = { $search: query.search };
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive;
        }
        if (query.supervisorId) {
            filter.supervisorId = new mongoose_2.Types.ObjectId(query.supervisorId);
        }
        if (query.badgeTier) {
            filter.badgeTier = query.badgeTier;
        }
        if (query.academicYear) {
            filter.academicYear = query.academicYear;
        }
        if (query.minPoints !== undefined || query.maxPoints !== undefined) {
            filter.points = {};
            if (query.minPoints !== undefined) {
                filter.points.$gte = query.minPoints;
            }
            if (query.maxPoints !== undefined) {
                filter.points.$lte = query.maxPoints;
            }
        }
        if (query.includeExpired === false) {
            const now = new Date();
            filter.$or = [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ];
        }
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
        const sort = {};
        sort[sortBy] = sortOrder;
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const [quests, total] = await Promise.all([
            this.questModel
                .find(filter)
                .populate('supervisorId', 'firstName lastName')
                .populate('createdBy', 'firstName lastName')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.questModel.countDocuments(filter).exec(),
        ]);
        const questsWithCounts = await Promise.all(quests.map(async (quest) => {
            const participantCount = await this.questParticipantModel
                .countDocuments({ questId: quest._id })
                .exec();
            const completionCount = await this.questParticipantModel
                .countDocuments({ questId: quest._id, status: 'completed' })
                .exec();
            return {
                ...this.transformToEntity(quest),
                participantCount,
                completionCount,
            };
        }));
        return {
            quests: questsWithCounts,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid quest ID format');
        }
        const quest = await this.questModel
            .findById(id)
            .populate('supervisorId', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .lean()
            .exec();
        if (!quest) {
            throw new common_1.NotFoundException(`Quest with ID ${id} not found`);
        }
        const [participantCount, completionCount] = await Promise.all([
            this.questParticipantModel.countDocuments({ questId: quest._id }).exec(),
            this.questParticipantModel.countDocuments({ questId: quest._id, status: 'completed' }).exec(),
        ]);
        return {
            ...this.transformToEntity(quest),
            participantCount,
            completionCount,
        };
    }
    async create(createQuestDto) {
        const questData = {
            ...createQuestDto,
            supervisorId: createQuestDto.supervisorId ? new mongoose_2.Types.ObjectId(createQuestDto.supervisorId) : undefined,
            createdBy: new mongoose_2.Types.ObjectId('507f1f77bcf86cd799439011'),
            createdAt: new Date(),
            isActive: true,
            expiresAt: createQuestDto.expiresAt ? new Date(createQuestDto.expiresAt) : undefined,
        };
        const createdQuest = await this.questModel.create(questData);
        const populatedQuest = await this.questModel
            .findById(createdQuest._id)
            .populate('supervisorId', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .lean()
            .exec();
        return {
            ...this.transformToEntity(populatedQuest),
            participantCount: 0,
            completionCount: 0,
        };
    }
    async update(id, updateQuestDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid quest ID format');
        }
        const updateData = { ...updateQuestDto };
        if (updateQuestDto.supervisorId) {
            updateData.supervisorId = new mongoose_2.Types.ObjectId(updateQuestDto.supervisorId);
        }
        if (updateQuestDto.expiresAt !== undefined) {
            updateData.expiresAt = updateQuestDto.expiresAt ? new Date(updateQuestDto.expiresAt) : null;
        }
        const updatedQuest = await this.questModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('supervisorId', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .lean()
            .exec();
        if (!updatedQuest) {
            throw new common_1.NotFoundException(`Quest with ID ${id} not found`);
        }
        const [participantCount, completionCount] = await Promise.all([
            this.questParticipantModel.countDocuments({ questId: updatedQuest._id }).exec(),
            this.questParticipantModel.countDocuments({ questId: updatedQuest._id, status: 'completed' }).exec(),
        ]);
        return {
            ...this.transformToEntity(updatedQuest),
            participantCount,
            completionCount,
        };
    }
    async remove(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid quest ID format');
        }
        const deletedQuest = await this.questModel.findByIdAndDelete(id).exec();
        if (!deletedQuest) {
            throw new common_1.NotFoundException(`Quest with ID ${id} not found`);
        }
        await this.questParticipantModel.deleteMany({ questId: deletedQuest._id }).exec();
    }
    async getStats() {
        const now = new Date();
        const [total, active, expired] = await Promise.all([
            this.questModel.countDocuments().exec(),
            this.questModel.countDocuments({
                isActive: true,
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: now } }
                ]
            }).exec(),
            this.questModel.countDocuments({
                expiresAt: { $lte: now }
            }).exec(),
        ]);
        return { total, active, expired };
    }
    transformToEntity(doc) {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            points: doc.points,
            supervisorId: doc.supervisorId?._id?.toString() || doc.supervisorId?.toString(),
            requiredPoints: doc.requiredPoints,
            isActive: doc.isActive,
            badgeTier: doc.badgeTier,
            badgeReason: doc.badgeReason,
            badgeIcon: doc.badgeIcon,
            slotsAvailable: doc.slotsAvailable,
            academicYear: doc.academicYear,
            createdBy: doc.createdBy?._id?.toString() || doc.createdBy?.toString(),
            createdAt: doc.createdAt,
            expiresAt: doc.expiresAt,
        };
    }
};
exports.QuestsService = QuestsService;
exports.QuestsService = QuestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(quest_entity_1.Quest.name)),
    __param(1, (0, mongoose_1.InjectModel)(quest_participant_schema_1.QuestParticipant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], QuestsService);
//# sourceMappingURL=quests.service.js.map