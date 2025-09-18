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
exports.AppealsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const appeal_entity_1 = require("./entities/appeal.entity");
const appeal_schema_1 = require("../../database/schemas/appeal.schema");
let AppealsService = class AppealsService {
    appealModel;
    constructor(appealModel) {
        this.appealModel = appealModel;
    }
    async create(createAppealDto) {
        const newAppeal = new this.appealModel({
            id: `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            pointLogId: createAppealDto.pointLogId,
            studentId: createAppealDto.studentId,
            reason: createAppealDto.reason,
            status: appeal_entity_1.AppealStatus.PENDING,
            submittedAt: new Date(),
            academicYear: createAppealDto.academicYear,
        });
        const savedAppeal = await newAppeal.save();
        return this.toAppealEntity(savedAppeal);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, studentId, reviewedBy, academicYear, sortBy = 'submittedAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (search) {
            filter.$text = { $search: search };
        }
        if (status) {
            filter.status = status;
        }
        if (studentId) {
            filter.studentId = studentId;
        }
        if (reviewedBy) {
            filter.reviewedBy = reviewedBy;
        }
        if (academicYear) {
            filter.academicYear = academicYear;
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;
        const [appeals, total] = await Promise.all([
            this.appealModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.appealModel.countDocuments(filter).exec(),
        ]);
        return {
            appeals: appeals.map(appeal => this.toAppealEntity(appeal)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const appeal = await this.appealModel.findOne({ id }).exec();
        if (!appeal) {
            throw new common_1.NotFoundException(`Appeal with ID ${id} not found`);
        }
        return this.toAppealEntity(appeal);
    }
    async update(id, updateAppealDto) {
        const updateData = {};
        if (updateAppealDto.reason !== undefined) {
            updateData.reason = updateAppealDto.reason;
        }
        if (updateAppealDto.status !== undefined) {
            updateData.status = updateAppealDto.status;
            if (updateAppealDto.status !== appeal_entity_1.AppealStatus.PENDING) {
                updateData.reviewedAt = new Date();
            }
        }
        if (updateAppealDto.reviewedBy !== undefined) {
            updateData.reviewedBy = updateAppealDto.reviewedBy;
        }
        if (updateAppealDto.reviewNotes !== undefined) {
            updateData.reviewNotes = updateAppealDto.reviewNotes;
        }
        if (updateAppealDto.academicYear !== undefined) {
            updateData.academicYear = updateAppealDto.academicYear;
        }
        const updatedAppeal = await this.appealModel.findOneAndUpdate({ id }, updateData, { new: true }).exec();
        if (!updatedAppeal) {
            throw new common_1.NotFoundException(`Appeal with ID ${id} not found`);
        }
        return this.toAppealEntity(updatedAppeal);
    }
    async remove(id) {
        const result = await this.appealModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Appeal with ID ${id} not found`);
        }
    }
    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.appealModel.countDocuments().exec(),
            this.appealModel.countDocuments({ status: appeal_entity_1.AppealStatus.PENDING }).exec(),
            this.appealModel.countDocuments({ status: appeal_entity_1.AppealStatus.APPROVED }).exec(),
            this.appealModel.countDocuments({ status: appeal_entity_1.AppealStatus.REJECTED }).exec(),
        ]);
        return {
            total,
            pending,
            approved,
            rejected,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
        };
    }
    toAppealEntity(doc) {
        return {
            id: doc.id,
            pointLogId: doc.pointLogId,
            studentId: doc.studentId,
            reason: doc.reason,
            status: doc.status,
            submittedAt: doc.submittedAt,
            reviewedBy: doc.reviewedBy,
            reviewedAt: doc.reviewedAt,
            reviewNotes: doc.reviewNotes,
            academicYear: doc.academicYear,
        };
    }
};
exports.AppealsService = AppealsService;
exports.AppealsService = AppealsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(appeal_schema_1.Appeal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AppealsService);
//# sourceMappingURL=appeals.service.js.map