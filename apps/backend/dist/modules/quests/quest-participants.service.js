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
exports.QuestParticipantsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const quest_participant_entity_1 = require("./entities/quest-participant.entity");
const logger_service_1 = require("../../common/services/logger.service");
const performance_service_1 = require("../../common/services/performance.service");
let QuestParticipantsService = class QuestParticipantsService {
    questParticipantModel;
    logger;
    performanceService;
    constructor(questParticipantModel, logger, performanceService) {
        this.questParticipantModel = questParticipantModel;
        this.logger = logger;
        this.performanceService = performanceService;
    }
    async create(createDto) {
        const timerId = `quest-participant-create-${Date.now()}`;
        this.performanceService.startTimer(timerId, { questId: createDto.questId, studentId: createDto.studentId });
        try {
            if (!createDto.questId || !createDto.studentId) {
                throw new common_1.BadRequestException('Quest ID and Student ID are required');
            }
            if (!mongoose_2.Types.ObjectId.isValid(createDto.questId)) {
                this.logger.warn('Invalid quest ID format provided', {
                    metadata: { questId: createDto.questId, type: typeof createDto.questId }
                });
                throw new common_1.BadRequestException('The quest you are trying to join is invalid. Please refresh the page and try again.');
            }
            if (!mongoose_2.Types.ObjectId.isValid(createDto.studentId)) {
                this.logger.warn('Invalid student ID format provided', {
                    metadata: { studentId: createDto.studentId, type: typeof createDto.studentId }
                });
                throw new common_1.BadRequestException('Your account information is invalid. Please log out and log back in.');
            }
            const studentExists = await this.questParticipantModel.db.collection('users').findOne({ _id: new mongoose_2.Types.ObjectId(createDto.studentId) }, { projection: { _id: 1, roles: 1 } });
            if (!studentExists) {
                this.logger.warn('Student not found in database', {
                    metadata: { studentId: createDto.studentId }
                });
                throw new common_1.BadRequestException('Your account was not found. Please contact your administrator.');
            }
            if (!studentExists.roles || !studentExists.roles.includes('student')) {
                this.logger.warn('User attempting to join quest without student role', {
                    metadata: { studentId: createDto.studentId, roles: studentExists.roles }
                });
                throw new common_1.BadRequestException('Only students can join quests. Please contact your administrator if you believe this is an error.');
            }
            const quest = await this.questParticipantModel.db.collection('quests').findOne({ _id: new mongoose_2.Types.ObjectId(createDto.questId) }, { projection: { isActive: 1, expiresAt: 1, slotsAvailable: 1, requiredPoints: 1, title: 1 } });
            if (!quest) {
                throw new common_1.NotFoundException('Quest not found');
            }
            if (quest.isActive === false) {
                throw new common_1.BadRequestException('This quest is not currently active');
            }
            if (quest.expiresAt && new Date(quest.expiresAt) < new Date()) {
                throw new common_1.BadRequestException('This quest has expired');
            }
            if (quest.slotsAvailable && quest.slotsAvailable > 0) {
                const currentParticipants = await this.questParticipantModel.countDocuments({
                    questId: new mongoose_2.Types.ObjectId(createDto.questId),
                });
                if (currentParticipants >= quest.slotsAvailable) {
                    throw new common_1.BadRequestException('No slots available for this quest');
                }
            }
            if (quest.requiredPoints !== undefined && quest.requiredPoints !== null) {
                const studentPoints = await this.questParticipantModel.db.collection('pointlogs').aggregate([
                    { $match: { studentId: new mongoose_2.Types.ObjectId(createDto.studentId) } },
                    { $group: { _id: null, totalPoints: { $sum: '$points' } } }
                ]).toArray();
                const totalPoints = studentPoints.length > 0 ? (studentPoints[0]?.totalPoints || 0) : 0;
                if (totalPoints > quest.requiredPoints) {
                    throw new common_1.BadRequestException(`You have too many points to join this quest. Maximum allowed: ${quest.requiredPoints}, you have: ${totalPoints}`);
                }
            }
            const existing = await this.questParticipantModel
                .findOne({
                questId: new mongoose_2.Types.ObjectId(createDto.questId),
                studentId: new mongoose_2.Types.ObjectId(createDto.studentId)
            })
                .exec();
            if (existing) {
                this.logger.log('Student attempted to join quest they are already participating in', {
                    metadata: { questId: createDto.questId, studentId: createDto.studentId }
                });
                throw new common_1.BadRequestException('You are already participating in this quest. Check your active quests to continue your progress.');
            }
            const questParticipantData = {
                questId: new mongoose_2.Types.ObjectId(createDto.questId),
                studentId: new mongoose_2.Types.ObjectId(createDto.studentId),
                joinedAt: new Date(),
                status: quest_participant_entity_1.QuestCompletionStatus.IN_PROGRESS,
                academicYear: createDto.academicYear,
            };
            const createdParticipant = await this.questParticipantModel.create(questParticipantData);
            const populatedParticipant = await this.questParticipantModel
                .findById(createdParticipant._id)
                .populate('questId', 'title')
                .populate('studentId', 'firstName lastName')
                .lean()
                .exec();
            const result = this.transformToEntity(populatedParticipant);
            this.logger.log('Quest participant created', {
                metadata: {
                    questId: result.questId,
                    studentId: result.studentId,
                    status: result.status,
                },
            });
            this.performanceService.endTimer(timerId, { participantId: `${result.questId}-${result.studentId}` });
            return result;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to create quest participant', error instanceof Error ? error.stack : String(error), {
                metadata: { questId: createDto.questId, studentId: createDto.studentId },
            });
            throw error;
        }
    }
    async findAll(query) {
        const timerId = `quest-participants-query-${Date.now()}`;
        this.performanceService.startTimer(timerId, { query });
        try {
            const { page = 1, limit = 10, questId, studentId, status, academicYear } = query;
            const filter = {};
            if (questId) {
                if (!mongoose_2.Types.ObjectId.isValid(questId)) {
                    throw new common_1.BadRequestException('Invalid quest ID format');
                }
                filter.questId = new mongoose_2.Types.ObjectId(questId);
            }
            if (studentId) {
                if (!mongoose_2.Types.ObjectId.isValid(studentId)) {
                    throw new common_1.BadRequestException('Invalid student ID format');
                }
                filter.studentId = new mongoose_2.Types.ObjectId(studentId);
            }
            if (status) {
                filter.status = status;
            }
            if (academicYear) {
                filter.academicYear = academicYear;
            }
            const skip = (page - 1) * limit;
            const [participants, total] = await Promise.all([
                this.questParticipantModel
                    .find(filter)
                    .populate('questId', 'title')
                    .populate('studentId', 'firstName lastName')
                    .sort({ joinedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                this.questParticipantModel.countDocuments(filter).exec(),
            ]);
            const transformedParticipants = participants.map(p => this.transformToEntity(p));
            const pagination = {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            };
            this.performanceService.endTimer(timerId, { total, page, limit });
            return { participants: transformedParticipants, total, pagination };
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to query quest participants', error instanceof Error ? error.stack : String(error), {
                metadata: { query },
            });
            throw error;
        }
    }
    async findOne(questId, studentId) {
        const timerId = `quest-participant-find-${Date.now()}`;
        this.performanceService.startTimer(timerId, { questId, studentId });
        try {
            if (!mongoose_2.Types.ObjectId.isValid(questId)) {
                throw new common_1.BadRequestException('Invalid quest ID format');
            }
            if (!mongoose_2.Types.ObjectId.isValid(studentId)) {
                throw new common_1.BadRequestException('Invalid student ID format');
            }
            const participant = await this.questParticipantModel
                .findOne({
                questId: new mongoose_2.Types.ObjectId(questId),
                studentId: new mongoose_2.Types.ObjectId(studentId)
            })
                .populate('questId', 'title')
                .populate('studentId', 'firstName lastName')
                .lean()
                .exec();
            if (!participant) {
                throw new common_1.NotFoundException(`Quest participant not found for quest ${questId} and student ${studentId}`);
            }
            const result = this.transformToEntity(participant);
            this.performanceService.endTimer(timerId, { found: true });
            return result;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to find quest participant', error instanceof Error ? error.stack : String(error), {
                metadata: { questId, studentId },
            });
            throw error;
        }
    }
    async update(questId, studentId, updateDto) {
        const timerId = `quest-participant-update-${Date.now()}`;
        this.performanceService.startTimer(timerId, { questId, studentId, updateDto });
        try {
            if (!mongoose_2.Types.ObjectId.isValid(questId)) {
                throw new common_1.BadRequestException('Invalid quest ID format');
            }
            if (!mongoose_2.Types.ObjectId.isValid(studentId)) {
                throw new common_1.BadRequestException('Invalid student ID format');
            }
            const updateData = { ...updateDto };
            if (updateDto.status === quest_participant_entity_1.QuestCompletionStatus.COMPLETED) {
                updateData.completedAt = new Date();
            }
            const updatedParticipant = await this.questParticipantModel
                .findOneAndUpdate({
                questId: new mongoose_2.Types.ObjectId(questId),
                studentId: new mongoose_2.Types.ObjectId(studentId)
            }, updateData, { new: true })
                .populate('questId', 'title')
                .populate('studentId', 'firstName lastName')
                .lean()
                .exec();
            if (!updatedParticipant) {
                throw new common_1.NotFoundException(`Quest participant not found for quest ${questId} and student ${studentId}`);
            }
            const result = this.transformToEntity(updatedParticipant);
            this.logger.log('Quest participant updated', {
                metadata: {
                    questId: result.questId,
                    studentId: result.studentId,
                    status: result.status,
                    changes: updateDto,
                },
            });
            this.performanceService.endTimer(timerId, { updated: true });
            return result;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to update quest participant', error instanceof Error ? error.stack : String(error), {
                metadata: { questId, studentId, updateDto },
            });
            throw error;
        }
    }
    async remove(questId, studentId) {
        const timerId = `quest-participant-remove-${Date.now()}`;
        this.performanceService.startTimer(timerId, { questId, studentId });
        try {
            if (!mongoose_2.Types.ObjectId.isValid(questId)) {
                throw new common_1.BadRequestException('Invalid quest ID format');
            }
            if (!mongoose_2.Types.ObjectId.isValid(studentId)) {
                throw new common_1.BadRequestException('Invalid student ID format');
            }
            const deletedParticipant = await this.questParticipantModel
                .findOneAndDelete({
                questId: new mongoose_2.Types.ObjectId(questId),
                studentId: new mongoose_2.Types.ObjectId(studentId)
            })
                .exec();
            if (!deletedParticipant) {
                throw new common_1.NotFoundException(`Quest participant not found for quest ${questId} and student ${studentId}`);
            }
            this.logger.log('Quest participant removed', {
                metadata: { questId, studentId },
            });
            this.performanceService.endTimer(timerId, { removed: true });
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to remove quest participant', error instanceof Error ? error.stack : String(error), {
                metadata: { questId, studentId },
            });
            throw error;
        }
    }
    transformToEntity(doc) {
        return {
            questId: doc.questId?._id?.toString() || doc.questId?.toString(),
            studentId: doc.studentId?._id?.toString() || doc.studentId?.toString(),
            joinedAt: doc.joinedAt,
            status: doc.status,
            completedAt: doc.completedAt,
            reviewNotes: doc.reviewNotes,
            academicYear: doc.academicYear,
        };
    }
};
exports.QuestParticipantsService = QuestParticipantsService;
exports.QuestParticipantsService = QuestParticipantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('QuestParticipant')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        logger_service_1.StructuredLoggerService,
        performance_service_1.PerformanceService])
], QuestParticipantsService);
//# sourceMappingURL=quest-participants.service.js.map