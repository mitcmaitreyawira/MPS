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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_schema_1 = require("../../database/schemas/class.schema");
const cache_service_1 = require("../../common/services/cache.service");
const performance_service_1 = require("../../common/services/performance.service");
const logger_service_1 = require("../../common/services/logger.service");
let ClassesService = class ClassesService {
    classModel;
    cacheService;
    performanceService;
    logger;
    constructor(classModel, cacheService, performanceService, logger) {
        this.classModel = classModel;
        this.cacheService = cacheService;
        this.performanceService = performanceService;
        this.logger = logger;
    }
    async findAll(query) {
        const timerId = 'findAllClasses-' + Date.now();
        this.performanceService.startTimer(timerId, { query });
        try {
            const filter = {};
            if (query.search) {
                filter.name = { $regex: query.search, $options: 'i' };
            }
            if (query.headTeacherId) {
                filter.headTeacherId = query.headTeacherId;
            }
            const sort = {};
            sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;
            const skip = ((query.page || 1) - 1) * (query.limit || 10);
            const [classes, total] = await Promise.all([
                this.classModel
                    .find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(query.limit || 10)
                    .populate('headTeacherId', 'firstName lastName email')
                    .exec(),
                this.classModel.countDocuments(filter).exec(),
            ]);
            const result = {
                classes,
                total,
                page: query.page || 1,
                limit: query.limit || 10,
            };
            this.performanceService.endTimer(timerId, { count: classes.length });
            return result;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            this.logger.error('Failed to find classes', error instanceof Error ? error.stack : String(error), { metadata: { query } });
            throw error;
        }
    }
    async findOne(id) {
        const timerId = 'findOneClass-' + Date.now();
        this.performanceService.startTimer(timerId, { id });
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            this.performanceService.endTimer(timerId, { error: true, reason: 'invalid_objectid' });
            this.logger.warn('Invalid ObjectId format provided for class lookup', {
                metadata: {
                    providedId: id,
                    expectedFormat: '24-character hexadecimal string',
                    example: '507f1f77bcf86cd799439011'
                }
            });
            throw new common_1.BadRequestException(`Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${id}". ` +
                `Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`);
        }
        try {
            const classEntity = await this.classModel
                .findById(id)
                .populate('headTeacherId', 'firstName lastName email')
                .exec();
            if (!classEntity) {
                this.performanceService.endTimer(timerId, { found: false });
                throw new common_1.NotFoundException(`Class with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId, { found: true });
            return classEntity;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to find class', error instanceof Error ? error.stack : String(error), { metadata: { id } });
            throw error;
        }
    }
    async create(createClassDto) {
        const timerId = 'createClass-' + Date.now();
        this.performanceService.startTimer(timerId, { name: createClassDto.name });
        try {
            const existingClass = await this.classModel.findOne({ name: createClassDto.name }).exec();
            if (existingClass) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'duplicate_name' });
                throw new common_1.ConflictException(`Class with name '${createClassDto.name}' already exists`);
            }
            const newClass = new this.classModel(createClassDto);
            const savedClass = await newClass.save();
            this.performanceService.endTimer(timerId, { success: true, classId: savedClass._id });
            this.logger.log('Class created successfully', { metadata: { classId: savedClass._id, name: createClassDto.name } });
            return savedClass;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error('Failed to create class', error instanceof Error ? error.stack : String(error), { metadata: { createClassDto } });
            throw error;
        }
    }
    async update(id, updateClassDto) {
        const timerId = 'updateClass-' + Date.now();
        this.performanceService.startTimer(timerId, { id });
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            this.performanceService.endTimer(timerId, { error: true, reason: 'invalid_objectid' });
            this.logger.warn('Invalid ObjectId format provided for class update', {
                metadata: {
                    providedId: id,
                    expectedFormat: '24-character hexadecimal string',
                    example: '507f1f77bcf86cd799439011'
                }
            });
            throw new common_1.BadRequestException(`Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${id}". ` +
                `Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`);
        }
        try {
            if (updateClassDto.name) {
                const existingClass = await this.classModel.findOne({
                    name: updateClassDto.name,
                    _id: { $ne: id }
                }).exec();
                if (existingClass) {
                    this.performanceService.endTimer(timerId, { error: true, reason: 'duplicate_name' });
                    throw new common_1.ConflictException(`Class with name '${updateClassDto.name}' already exists`);
                }
            }
            const updatedClass = await this.classModel
                .findByIdAndUpdate(id, updateClassDto, { new: true })
                .populate('headTeacherId', 'firstName lastName email')
                .exec();
            if (!updatedClass) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'not_found' });
                throw new common_1.NotFoundException(`Class with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId, { success: true, classId: id });
            this.logger.log('Class updated successfully', { metadata: { classId: id, updates: updateClassDto } });
            return updatedClass;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error('Failed to update class', error instanceof Error ? error.stack : String(error), { metadata: { id, updateClassDto } });
            throw error;
        }
    }
    async remove(id) {
        const timerId = 'removeClass-' + Date.now();
        this.performanceService.startTimer(timerId, { id });
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            this.performanceService.endTimer(timerId, { error: true, reason: 'invalid_objectid' });
            this.logger.warn('Invalid ObjectId format provided for class deletion', {
                metadata: {
                    providedId: id,
                    expectedFormat: '24-character hexadecimal string',
                    example: '507f1f77bcf86cd799439011'
                }
            });
            throw new common_1.BadRequestException(`Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${id}". ` +
                `Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`);
        }
        try {
            const deletedClass = await this.classModel.findByIdAndDelete(id).exec();
            if (!deletedClass) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'not_found' });
                throw new common_1.NotFoundException(`Class with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId, { success: true, classId: id });
            this.logger.log('Class deleted successfully', { metadata: { classId: id, name: deletedClass.name } });
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to delete class', error instanceof Error ? error.stack : String(error), { metadata: { id } });
            throw error;
        }
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(class_schema_1.Class.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cache_service_1.CacheService,
        performance_service_1.PerformanceService,
        logger_service_1.StructuredLoggerService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map