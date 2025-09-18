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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
const award_schema_1 = require("../../database/schemas/award.schema");
const class_schema_1 = require("../../database/schemas/class.schema");
const point_log_schema_1 = require("../../database/schemas/point-log.schema");
const quest_schema_1 = require("../../database/schemas/quest.schema");
let AdminService = AdminService_1 = class AdminService {
    userModel;
    awardModel;
    classModel;
    pointLogModel;
    questModel;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(userModel, awardModel, classModel, pointLogModel, questModel) {
        this.userModel = userModel;
        this.awardModel = awardModel;
        this.classModel = classModel;
        this.pointLogModel = pointLogModel;
        this.questModel = questModel;
    }
    async bulkDeleteUsers(userIds) {
        this.logger.warn(`Attempting to bulk delete ${userIds.length} users: ${userIds.join(', ')}`);
        const existingUsers = await this.userModel.find({ _id: { $in: userIds } });
        if (existingUsers.length !== userIds.length) {
            throw new common_1.NotFoundException('Some users not found');
        }
        await this.pointLogModel.deleteMany({ studentId: { $in: userIds } });
        await this.awardModel.deleteMany({ recipientId: { $in: userIds } });
        const result = await this.userModel.deleteMany({ _id: { $in: userIds } });
        this.logger.error(`DELETED ${result.deletedCount} users permanently`);
        return { deletedCount: result.deletedCount };
    }
    async deleteBadge(badgeId) {
        this.logger.warn(`Deleting badge: ${badgeId}`);
        const badge = await this.awardModel.findById(badgeId);
        if (!badge) {
            throw new common_1.NotFoundException('Badge not found');
        }
        const affectedUsersCount = await this.awardModel.countDocuments({ _id: badgeId });
        await this.awardModel.deleteOne({ _id: badgeId });
        this.logger.error(`DELETED badge ${badgeId}, affected ${affectedUsersCount} users`);
        return { deletedBadge: badgeId, affectedUsers: affectedUsersCount };
    }
    async emergencySystemReset() {
        const timestamp = new Date().toISOString();
        this.logger.error(`EMERGENCY SYSTEM RESET INITIATED at ${timestamp}`);
        await this.userModel.updateMany({ role: 'student' }, { $set: { points: 0 } });
        await this.pointLogModel.deleteMany({});
        await this.questModel.updateMany({}, { $set: { status: 'draft', participants: [] } });
        await this.awardModel.deleteMany({});
        this.logger.error('EMERGENCY RESET COMPLETED - System data has been reset');
        return {
            message: 'Emergency system reset completed successfully',
            timestamp
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(award_schema_1.Award.name)),
    __param(2, (0, mongoose_1.InjectModel)(class_schema_1.Class.name)),
    __param(3, (0, mongoose_1.InjectModel)(point_log_schema_1.PointLog.name)),
    __param(4, (0, mongoose_1.InjectModel)(quest_schema_1.Quest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map