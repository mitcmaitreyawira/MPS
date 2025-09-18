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
exports.PointLogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const point_log_entity_1 = require("./entities/point-log.entity");
const point_log_schema_1 = require("../../database/schemas/point-log.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
let PointLogsService = class PointLogsService {
    pointLogModel;
    userModel;
    constructor(pointLogModel, userModel) {
        this.pointLogModel = pointLogModel;
        this.userModel = userModel;
        this.initializeStudentPoints();
    }
    async initializeStudentPoints() {
        try {
            const students = await this.userModel.find({ roles: 'student' }).exec();
            for (const student of students) {
                const existingLogs = await this.pointLogModel.countDocuments({ studentId: student._id });
                if (existingLogs === 0) {
                    await this.pointLogModel.create({
                        studentId: student._id,
                        points: 100,
                        type: point_log_entity_1.PointType.REWARD,
                        category: 'Initial Points',
                        description: 'Welcome bonus - starting points',
                        addedBy: student._id,
                        timestamp: new Date(),
                        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                    });
                }
            }
        }
        catch (error) {
            console.error('Error initializing student points:', error);
        }
    }
    async getStudentTotalPoints(studentId) {
        const logs = await this.pointLogModel.find({ studentId }).exec();
        return logs.reduce((total, log) => total + log.points, 0);
    }
    convertToEntity(doc) {
        return {
            id: doc._id.toString(),
            studentId: doc.studentId,
            points: doc.points,
            type: doc.type,
            category: doc.category,
            description: doc.description,
            timestamp: doc.timestamp,
            addedBy: doc.addedBy,
            badge: doc.badge,
            academicYear: doc.academicYear,
        };
    }
    async create(createPointLogDto) {
        const targetUser = await this.userModel.findById(createPointLogDto.studentId).exec();
        if (!targetUser) {
            throw new common_1.NotFoundException(`User with ID ${createPointLogDto.studentId} not found`);
        }
        const hasStudentRole = targetUser.roles && targetUser.roles.includes('student');
        if (!hasStudentRole) {
            throw new common_1.BadRequestException('Points can only be awarded to users with the student role');
        }
        const normalizedPoints = createPointLogDto.type === point_log_entity_1.PointType.VIOLATION
            ? -Math.abs(createPointLogDto.points)
            : Math.abs(createPointLogDto.points);
        const currentTotal = await this.getStudentTotalPoints(createPointLogDto.studentId);
        const newTotal = currentTotal + normalizedPoints;
        let adjustedPoints = normalizedPoints;
        if (newTotal > 100 && normalizedPoints > 0) {
            adjustedPoints = Math.max(0, 100 - currentTotal);
        }
        const pointLog = await this.pointLogModel.create({
            ...createPointLogDto,
            points: adjustedPoints,
            timestamp: new Date(),
        });
        return this.convertToEntity(pointLog);
    }
    async bulkCreate(bulkCreatePointLogsDto) {
        const createdPointLogs = [];
        for (const pointLogDto of bulkCreatePointLogsDto.pointLogs) {
            const created = await this.create(pointLogDto);
            createdPointLogs.push(created);
        }
        return createdPointLogs;
    }
    async findAll(query) {
        const { page = 1, limit = 10, studentId, type, category, addedBy, startDate, endDate, academicYear, } = query;
        const filter = {};
        if (studentId)
            filter.studentId = studentId;
        if (type)
            filter.type = type;
        if (category)
            filter.category = new RegExp(category, 'i');
        if (addedBy)
            filter.addedBy = addedBy;
        if (academicYear)
            filter.academicYear = academicYear;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate)
                filter.timestamp.$gte = new Date(startDate);
            if (endDate)
                filter.timestamp.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.pointLogModel.find(filter).skip(skip).limit(limit).sort({ timestamp: -1 }).exec(),
            this.pointLogModel.countDocuments(filter).exec(),
        ]);
        return {
            data: data.map(doc => this.convertToEntity(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.NotFoundException(`Point log with ID ${id} not found`);
        }
        const pointLog = await this.pointLogModel.findById(id).exec();
        if (!pointLog) {
            throw new common_1.NotFoundException(`Point log with ID ${id} not found`);
        }
        return this.convertToEntity(pointLog);
    }
    async update(id, updatePointLogDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.NotFoundException(`Point log with ID ${id} not found`);
        }
        const pointLog = await this.pointLogModel.findByIdAndUpdate(id, updatePointLogDto, { new: true }).exec();
        if (!pointLog) {
            throw new common_1.NotFoundException(`Point log with ID ${id} not found`);
        }
        return this.convertToEntity(pointLog);
    }
    async remove(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.NotFoundException(`Point log with ID ${id} not found`);
        }
        const result = await this.pointLogModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Point log with ID ${id} not found`);
        }
    }
    async getStats() {
        const logs = await this.pointLogModel.find().exec();
        const totalEntries = logs.length;
        const totalPointsAwarded = logs.filter(log => log.points > 0).reduce((sum, log) => sum + log.points, 0);
        const totalPointsDeducted = Math.abs(logs.filter(log => log.points < 0).reduce((sum, log) => sum + log.points, 0));
        const netPoints = totalPointsAwarded - totalPointsDeducted;
        const entriesByType = logs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        }, {});
        const entriesByCategory = logs.reduce((acc, log) => {
            acc[log.category] = (acc[log.category] || 0) + 1;
            return acc;
        }, {});
        const badgesAwarded = logs.filter(log => log.badge).length;
        const averagePointsPerEntry = totalEntries > 0 ? (totalPointsAwarded + totalPointsDeducted) / totalEntries : 0;
        return {
            totalEntries,
            totalPointsAwarded,
            totalPointsDeducted,
            netPoints,
            entriesByType,
            entriesByCategory,
            badgesAwarded,
            averagePointsPerEntry,
        };
    }
    async getStudentSummary(studentId) {
        const logs = await this.pointLogModel.find({ studentId }).sort({ timestamp: -1 }).exec();
        const totalPoints = Math.min(100, logs.reduce((sum, log) => sum + log.points, 0));
        const recentLogs = logs.slice(0, 10).map(doc => this.convertToEntity(doc));
        const pointsByCategory = logs.reduce((acc, log) => {
            acc[log.category] = (acc[log.category] || 0) + log.points;
            return acc;
        }, {});
        const badges = logs.filter(log => log.badge).map(log => log.badge);
        return {
            studentId,
            totalPoints,
            percentage: totalPoints,
            recentLogs,
            pointsByCategory,
            badges,
            logCount: logs.length,
        };
    }
};
exports.PointLogsService = PointLogsService;
exports.PointLogsService = PointLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(point_log_schema_1.PointLog.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PointLogsService);
//# sourceMappingURL=point-logs.service.js.map