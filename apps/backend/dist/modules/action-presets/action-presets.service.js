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
exports.ActionPresetsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const action_preset_schema_1 = require("../../database/schemas/action-preset.schema");
const logger_service_1 = require("../../common/services/logger.service");
const performance_service_1 = require("../../common/services/performance.service");
let ActionPresetsService = class ActionPresetsService {
    actionPresetModel;
    logger;
    performanceService;
    constructor(actionPresetModel, logger, performanceService) {
        this.actionPresetModel = actionPresetModel;
        this.logger = logger;
        this.performanceService = performanceService;
    }
    async findAll(query) {
        const timerId = `findAllActionPresets_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const { page = 1, limit = 10, search, type, category, isArchived = false, sortBy = 'createdAt', sortOrder = 'desc' } = query;
            const skip = (page - 1) * limit;
            const filter = { isArchived };
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            if (type) {
                filter.type = type;
            }
            if (category) {
                filter.category = { $regex: category, $options: 'i' };
            }
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const [actionPresets, total] = await Promise.all([
                this.actionPresetModel
                    .find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate('createdBy', 'name email')
                    .exec(),
                this.actionPresetModel.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(total / limit);
            this.performanceService.endTimer(timerId);
            this.logger.log('Action presets retrieved successfully', {
                metadata: {
                    query,
                    total,
                    page,
                    totalPages,
                },
            });
            return {
                data: actionPresets,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to retrieve action presets', error instanceof Error ? error.stack : String(error), {
                metadata: { query },
            });
            throw error;
        }
    }
    async findOne(id) {
        const timerId = `findOneActionPreset_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const actionPreset = await this.actionPresetModel
                .findById(id)
                .populate('createdBy', 'name email')
                .exec();
            if (!actionPreset) {
                throw new common_1.NotFoundException(`Action preset with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId);
            this.logger.log('Action preset retrieved successfully', {
                metadata: { id },
            });
            return actionPreset;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to retrieve action preset', error instanceof Error ? error.stack : String(error), {
                metadata: { id },
            });
            throw error;
        }
    }
    async create(createActionPresetDto) {
        const timerId = `createActionPreset_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const existingActionPreset = await this.actionPresetModel
                .findOne({ name: createActionPresetDto.name, isArchived: false })
                .exec();
            if (existingActionPreset) {
                throw new common_1.ConflictException(`Action preset with name '${createActionPresetDto.name}' already exists`);
            }
            const actionPreset = new this.actionPresetModel(createActionPresetDto);
            const savedActionPreset = await actionPreset.save();
            await savedActionPreset.populate('createdBy', 'name email');
            this.performanceService.endTimer(timerId);
            this.logger.log('Action preset created successfully', {
                metadata: {
                    createActionPresetDto,
                    actionPresetId: savedActionPreset._id,
                },
            });
            return savedActionPreset;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to create action preset', error instanceof Error ? error.stack : String(error), {
                metadata: { createActionPresetDto },
            });
            throw error;
        }
    }
    async update(id, updateActionPresetDto) {
        const timerId = `updateActionPreset_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const existingActionPreset = await this.actionPresetModel.findById(id).exec();
            if (!existingActionPreset) {
                throw new common_1.NotFoundException(`Action preset with ID ${id} not found`);
            }
            if (updateActionPresetDto.name && updateActionPresetDto.name !== existingActionPreset.name) {
                const duplicateActionPreset = await this.actionPresetModel
                    .findOne({
                    name: updateActionPresetDto.name,
                    _id: { $ne: id },
                    isArchived: false
                })
                    .exec();
                if (duplicateActionPreset) {
                    throw new common_1.ConflictException(`Action preset with name '${updateActionPresetDto.name}' already exists`);
                }
            }
            const updatedActionPreset = await this.actionPresetModel
                .findByIdAndUpdate(id, updateActionPresetDto, { new: true })
                .populate('createdBy', 'name email')
                .exec();
            this.performanceService.endTimer(timerId);
            this.logger.log('Action preset updated successfully', {
                metadata: {
                    id,
                    updateActionPresetDto,
                },
            });
            return updatedActionPreset;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to update action preset', error instanceof Error ? error.stack : String(error), {
                metadata: { id, updateActionPresetDto },
            });
            throw error;
        }
    }
    async remove(id) {
        const timerId = `removeActionPreset_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const actionPreset = await this.actionPresetModel.findById(id).exec();
            if (!actionPreset) {
                throw new common_1.NotFoundException(`Action preset with ID ${id} not found`);
            }
            await this.actionPresetModel.findByIdAndDelete(id).exec();
            this.performanceService.endTimer(timerId);
            this.logger.log('Action preset deleted successfully', {
                metadata: { id },
            });
            return { message: 'Action preset deleted successfully' };
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to delete action preset', error instanceof Error ? error.stack : String(error), {
                metadata: { id },
            });
            throw error;
        }
    }
};
exports.ActionPresetsService = ActionPresetsService;
exports.ActionPresetsService = ActionPresetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(action_preset_schema_1.ActionPreset.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        logger_service_1.StructuredLoggerService,
        performance_service_1.PerformanceService])
], ActionPresetsService);
//# sourceMappingURL=action-presets.service.js.map