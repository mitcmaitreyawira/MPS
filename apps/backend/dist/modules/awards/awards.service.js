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
exports.AwardsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const award_entity_1 = require("./entities/award.entity");
const award_schema_1 = require("../../database/schemas/award.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
let AwardsService = class AwardsService {
    awardModel;
    userModel;
    constructor(awardModel, userModel) {
        this.awardModel = awardModel;
        this.userModel = userModel;
    }
    canGrantAwardTier(userRoles, tier) {
        const hasAdminRole = userRoles.some(role => ['admin', 'head_of_class'].includes(role));
        const hasTeacherRole = userRoles.some(role => role === 'teacher');
        switch (tier) {
            case award_entity_1.AwardTier.GOLD:
            case award_entity_1.AwardTier.SILVER:
                return hasAdminRole;
            case award_entity_1.AwardTier.BRONZE:
                return hasAdminRole || hasTeacherRole;
            default:
                return false;
        }
    }
    async convertToEntity(doc) {
        const recipient = doc.recipientId ? await this.userModel.findById(doc.recipientId).exec() : null;
        const awardedByUser = await this.userModel.findById(doc.awardedBy).exec();
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            tier: doc.tier,
            status: doc.status,
            recipientId: doc.recipientId ? doc.recipientId.toString() : '',
            recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}` : (doc.isTemplate ? 'Template' : 'Unknown'),
            awardedBy: doc.awardedBy.toString(),
            awardedByName: awardedByUser ? `${awardedByUser.firstName} ${awardedByUser.lastName}` : 'Unknown',
            awardedOn: doc.awardedOn,
            reason: doc.reason,
            icon: doc.icon,
            academicYear: doc.academicYear,
            metadata: doc.metadata,
            isTemplate: doc.isTemplate,
            templateName: doc.templateName,
            pointValue: doc.pointValue || award_entity_1.AWARD_POINT_VALUES[doc.tier],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    async create(createAwardDto, currentUser) {
        if (!this.canGrantAwardTier(currentUser.roles, createAwardDto.tier)) {
            throw new common_1.ForbiddenException(`You don't have permission to grant ${createAwardDto.tier} awards`);
        }
        if (!createAwardDto.isTemplate) {
            if (!createAwardDto.recipientId) {
                throw new common_1.BadRequestException('Recipient ID is required for non-template awards');
            }
            const recipient = await this.userModel.findById(createAwardDto.recipientId).exec();
            if (!recipient) {
                throw new common_1.NotFoundException('Recipient not found');
            }
        }
        const awardData = {
            ...createAwardDto,
            awardedBy: new mongoose_2.Types.ObjectId(currentUser.id),
            status: award_entity_1.AwardStatus.ACTIVE,
            pointValue: award_entity_1.AWARD_POINT_VALUES[createAwardDto.tier],
            academicYear: createAwardDto.academicYear || this.getCurrentAcademicYear(),
            ...(createAwardDto.recipientId && { recipientId: new mongoose_2.Types.ObjectId(createAwardDto.recipientId) }),
        };
        const createdAward = new this.awardModel(awardData);
        const savedAward = await createdAward.save();
        return this.convertToEntity(savedAward);
    }
    async findAll(query) {
        const { page = 1, limit = 10, recipientId, awardedBy, tier, status, academicYear, search, isTemplate, sortBy = 'awardedOn', sortOrder = 'desc' } = query;
        const filter = {};
        if (recipientId)
            filter.recipientId = new mongoose_2.Types.ObjectId(recipientId);
        if (awardedBy)
            filter.awardedBy = new mongoose_2.Types.ObjectId(awardedBy);
        if (tier)
            filter.tier = tier;
        if (status)
            filter.status = status;
        if (academicYear)
            filter.academicYear = academicYear;
        if (typeof isTemplate === 'boolean')
            filter.isTemplate = isTemplate;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { reason: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const [awards, total] = await Promise.all([
            this.awardModel
                .find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.awardModel.countDocuments(filter).exec()
        ]);
        const awardEntities = await Promise.all(awards.map(award => this.convertToEntity(award)));
        return {
            awards: awardEntities,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid award ID');
        }
        const award = await this.awardModel.findById(id).exec();
        if (!award) {
            throw new common_1.NotFoundException('Award not found');
        }
        return this.convertToEntity(award);
    }
    async update(id, updateAwardDto, currentUser) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid award ID');
        }
        const existingAward = await this.awardModel.findById(id).exec();
        if (!existingAward) {
            throw new common_1.NotFoundException('Award not found');
        }
        if (updateAwardDto.tier && updateAwardDto.tier !== existingAward.tier) {
            if (!this.canGrantAwardTier(currentUser.roles, updateAwardDto.tier)) {
                throw new common_1.ForbiddenException(`You don't have permission to change award to ${updateAwardDto.tier} tier`);
            }
        }
        const updateData = { ...updateAwardDto };
        if (updateAwardDto.tier) {
            updateData.pointValue = award_entity_1.AWARD_POINT_VALUES[updateAwardDto.tier];
        }
        const updatedAward = await this.awardModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        return this.convertToEntity(updatedAward);
    }
    async remove(id, currentUser) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid award ID');
        }
        const award = await this.awardModel.findById(id).exec();
        if (!award) {
            throw new common_1.NotFoundException('Award not found');
        }
        if (!this.canGrantAwardTier(currentUser.roles, award.tier)) {
            throw new common_1.ForbiddenException(`You don't have permission to revoke ${award.tier} awards`);
        }
        await this.awardModel
            .findByIdAndUpdate(id, { status: award_entity_1.AwardStatus.REVOKED })
            .exec();
    }
    async getStats() {
        const [totalAwards, awardsByTier, awardsByStatus, recentAwards] = await Promise.all([
            this.awardModel.countDocuments({ status: award_entity_1.AwardStatus.ACTIVE }).exec(),
            this.awardModel.aggregate([
                { $match: { status: award_entity_1.AwardStatus.ACTIVE } },
                { $group: { _id: '$tier', count: { $sum: 1 } } }
            ]).exec(),
            this.awardModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]).exec(),
            this.awardModel
                .find({ status: award_entity_1.AwardStatus.ACTIVE })
                .sort({ awardedOn: -1 })
                .limit(10)
                .exec()
        ]);
        const recentAwardEntities = await Promise.all(recentAwards.map(award => this.convertToEntity(award)));
        return {
            totalAwards,
            awardsByTier: awardsByTier.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            awardsByStatus: awardsByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            recentAwards: recentAwardEntities
        };
    }
    async getStudentSummary(studentId) {
        if (!mongoose_2.Types.ObjectId.isValid(studentId)) {
            throw new common_1.BadRequestException('Invalid student ID');
        }
        const [awards, totalPoints] = await Promise.all([
            this.awardModel
                .find({ recipientId: new mongoose_2.Types.ObjectId(studentId), status: award_entity_1.AwardStatus.ACTIVE })
                .sort({ awardedOn: -1 })
                .exec(),
            this.awardModel.aggregate([
                { $match: { recipientId: new mongoose_2.Types.ObjectId(studentId), status: award_entity_1.AwardStatus.ACTIVE } },
                { $group: { _id: null, totalPoints: { $sum: '$pointValue' } } }
            ]).exec()
        ]);
        const awardEntities = await Promise.all(awards.map(award => this.convertToEntity(award)));
        const awardsByTier = awards.reduce((acc, award) => {
            acc[award.tier] = (acc[award.tier] || 0) + 1;
            return acc;
        }, {});
        return {
            awards: awardEntities,
            totalAwards: awards.length,
            totalPoints: totalPoints[0]?.totalPoints || 0,
            awardsByTier
        };
    }
    async getTemplates() {
        const templates = await this.awardModel
            .find({ isTemplate: true })
            .sort({ templateName: 1 })
            .exec();
        return Promise.all(templates.map(template => this.convertToEntity(template)));
    }
    async createFromTemplate(templateId, recipientId, currentUser) {
        const template = await this.awardModel.findById(templateId).exec();
        if (!template || !template.isTemplate) {
            throw new common_1.NotFoundException('Template not found');
        }
        const createDto = {
            name: template.name,
            description: template.description,
            tier: template.tier,
            recipientId,
            reason: template.reason,
            icon: template.icon,
            academicYear: this.getCurrentAcademicYear(),
            metadata: template.metadata
        };
        return this.create(createDto, currentUser);
    }
    getCurrentAcademicYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        if (month >= 7) {
            return `${year}-${year + 1}`;
        }
        else {
            return `${year - 1}-${year}`;
        }
    }
    async getLeaderboard(limit = 30) {
        const leaderboard = await this.awardModel.aggregate([
            { $match: { status: award_entity_1.AwardStatus.ACTIVE } },
            {
                $group: {
                    _id: '$recipientId',
                    totalPoints: { $sum: '$pointValue' },
                    totalAwards: { $sum: 1 },
                    goldAwards: {
                        $sum: { $cond: [{ $eq: ['$tier', award_entity_1.AwardTier.GOLD] }, 1, 0] }
                    },
                    silverAwards: {
                        $sum: { $cond: [{ $eq: ['$tier', award_entity_1.AwardTier.SILVER] }, 1, 0] }
                    },
                    bronzeAwards: {
                        $sum: { $cond: [{ $eq: ['$tier', award_entity_1.AwardTier.BRONZE] }, 1, 0] }
                    }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: limit }
        ]).exec();
        const leaderboardWithUsers = await Promise.all(leaderboard.map(async (entry) => {
            const user = await this.userModel.findById(entry._id).exec();
            return {
                ...entry,
                userId: entry._id.toString(),
                userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
                userAvatar: user?.avatar || null
            };
        }));
        return leaderboardWithUsers;
    }
    async getAwardPointsForUsers(userIds) {
        const awardPoints = await this.awardModel.aggregate([
            {
                $match: {
                    status: award_entity_1.AwardStatus.ACTIVE,
                    recipientId: { $in: userIds.map(id => new mongoose_2.Types.ObjectId(id)) }
                }
            },
            {
                $group: {
                    _id: '$recipientId',
                    totalPoints: { $sum: '$pointValue' }
                }
            }
        ]).exec();
        const result = {};
        userIds.forEach(userId => {
            result[userId] = 0;
        });
        awardPoints.forEach(entry => {
            result[entry._id.toString()] = entry.totalPoints;
        });
        return result;
    }
};
exports.AwardsService = AwardsService;
exports.AwardsService = AwardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(award_schema_1.Award.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AwardsService);
//# sourceMappingURL=awards.service.js.map