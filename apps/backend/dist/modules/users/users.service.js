"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../../database/schemas/user.schema");
const cache_service_1 = require("../../common/services/cache.service");
const performance_service_1 = require("../../common/services/performance.service");
const error_response_service_1 = require("../../common/services/error-response.service");
const user_data_transformer_helper_1 = require("./helpers/user-data-transformer.helper");
const user_validation_helper_1 = require("./helpers/user-validation.helper");
const user_performance_helper_1 = require("./helpers/user-performance.helper");
const user_cache_helper_1 = require("./helpers/user-cache.helper");
const point_logs_service_1 = require("../points/point-logs.service");
const point_log_entity_1 = require("../points/entities/point-log.entity");
const audit_service_1 = require("../auth/services/audit.service");
const audit_action_enum_1 = require("../auth/enums/audit-action.enum");
let UsersService = class UsersService {
    userModel;
    connection;
    cacheService;
    performanceService;
    errorResponseService;
    pointLogsService;
    auditService;
    performanceHelper;
    cacheHelper;
    validationHelper;
    constructor(userModel, connection, cacheService, performanceService, errorResponseService, pointLogsService, auditService) {
        this.userModel = userModel;
        this.connection = connection;
        this.cacheService = cacheService;
        this.performanceService = performanceService;
        this.errorResponseService = errorResponseService;
        this.pointLogsService = pointLogsService;
        this.auditService = auditService;
        this.performanceHelper = new user_performance_helper_1.UserPerformanceHelper(performanceService);
        this.cacheHelper = new user_cache_helper_1.UserCacheHelper(cacheService);
        this.validationHelper = new user_validation_helper_1.UserValidationHelper(userModel);
    }
    async executeWithoutTransaction(operation, operationName) {
        try {
            return await operation();
        }
        catch (error) {
            console.error(`Failed to execute ${operationName}:`, error);
            throw error;
        }
    }
    async findByClassId(classId) {
        const timerId = `findUsersByClass-${Date.now()}`;
        this.performanceService.startTimer(timerId, { classId });
        try {
            const dbStartTime = Date.now();
            const users = await this.userModel
                .find({ classId, isArchived: { $ne: true }, roles: 'student' })
                .select('-password')
                .populate('classId', 'name _id')
                .exec();
            const dbDuration = Date.now() - dbStartTime;
            this.performanceService.trackDatabaseOperation('find', 'users', dbDuration, {
                count: users.length,
                classId,
            });
            this.performanceService.endTimer(timerId, { success: true, count: users.length });
            return users;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
    async findAll(query) {
        const timerId = this.performanceHelper.startTimer('findAllUsers', { query });
        try {
            const cached = await this.cacheHelper.getUsersListFromCache(query);
            if (cached) {
                this.performanceService.endTimer(timerId, { cached: true, count: cached.users.length });
                return cached;
            }
            const filter = user_data_transformer_helper_1.UserDataTransformer.buildFilterQuery(query);
            const { sort, skip, selectFields } = user_data_transformer_helper_1.UserDataTransformer.buildQueryOptions(query);
            const dbStartTime = Date.now();
            const [users, total] = await Promise.all([
                this.userModel
                    .find(filter)
                    .select(selectFields)
                    .sort(sort)
                    .skip(skip)
                    .limit(query.limit || 10)
                    .populate('classId', 'name _id')
                    .exec(),
                this.userModel.countDocuments(filter).exec(),
            ]);
            const dbDuration = Date.now() - dbStartTime;
            this.performanceService.trackDatabaseOperation('find', 'users', dbDuration, {
                count: users.length,
                total,
                page: query.page || 1,
                limit: query.limit || 10,
            });
            const result = {
                users,
                total,
                page: query.page || 1,
                limit: query.limit || 10,
            };
            await this.cacheHelper.cacheUsersList(query, result);
            this.performanceService.endTimer(timerId, { cached: false, count: users.length });
            return result;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
    async findOne(id) {
        user_validation_helper_1.UserValidationHelper.validateUserId(id);
        const timerId = `findOne-${id}`;
        this.performanceService.startTimer(timerId, { userId: id });
        try {
            const cachedUser = await this.cacheHelper.getUserFromCache(id);
            if (cachedUser) {
                this.performanceService.endTimer(timerId, { cacheHit: true });
                return cachedUser;
            }
            const dbStartTime = Date.now();
            const user = await this.userModel.findById(id).select('-password').populate('classId', 'name _id').exec();
            const dbDuration = Date.now() - dbStartTime;
            this.performanceService.trackDatabaseOperation('findById', 'users', dbDuration, {
                userId: id,
                found: !!user,
            });
            if (!user) {
                this.performanceService.endTimer(timerId, { found: false });
                throw new common_1.NotFoundException('User not found');
            }
            await this.cacheHelper.cacheUser(id, user);
            this.performanceService.endTimer(timerId, { cacheHit: false, found: true });
            return user;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
    async create(createUserDto) {
        const timerId = this.performanceHelper.startTimer('createUser', { nisn: createUserDto.nisn || 'no-nisn' });
        try {
            return await this.executeWithoutTransaction(async () => {
                if (createUserDto.nisn) {
                    createUserDto.nisn = createUserDto.nisn.trim();
                }
                let hashedPassword = '';
                if (createUserDto.password) {
                    const saltRounds = 12;
                    hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
                }
                const userData = user_data_transformer_helper_1.UserDataTransformer.transformCreateDto(createUserDto, hashedPassword);
                const createStartTime = Date.now();
                const newUser = new this.userModel(userData);
                const savedUser = await newUser.save();
                const createDuration = Date.now() - createStartTime;
                this.performanceService.trackDatabaseOperation('create', 'users', createDuration, {
                    userId: savedUser._id.toString(),
                    roles: savedUser.roles,
                });
                if (savedUser.roles && savedUser.roles.includes('student')) {
                    await this.pointLogsService.create({
                        studentId: savedUser._id.toString(),
                        points: 100,
                        type: point_log_entity_1.PointType.REWARD,
                        category: 'Initial Setup',
                        description: 'Welcome bonus - starting points for new student',
                        addedBy: 'system',
                        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                    });
                    console.log(`✅ Initial 100 points granted to new student: ${savedUser.firstName} ${savedUser.lastName} (${savedUser.nisn || savedUser._id})`);
                }
                const userResponse = savedUser.toObject();
                delete userResponse.password;
                return userResponse;
            }, 'createUser');
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
        finally {
            try {
                await this.cacheHelper.invalidateUsersListCache();
                this.performanceService.endTimer(timerId, { success: true });
            }
            catch (cacheError) {
                console.warn('Cache invalidation failed:', cacheError);
            }
        }
    }
    async createBulk(createUserDtos) {
        const timerId = this.performanceHelper.startTimer('createBulkUsers', { count: createUserDtos.length });
        const created = [];
        const errors = [];
        try {
            return await this.executeWithoutTransaction(async () => {
                for (let i = 0; i < createUserDtos.length; i++) {
                    const dto = createUserDtos[i];
                    if (!dto)
                        continue;
                    try {
                        if (dto.nisn) {
                            dto.nisn = dto.nisn.trim();
                        }
                        let hashedPassword = '';
                        if (dto.password) {
                            const saltRounds = 12;
                            hashedPassword = await bcrypt.hash(dto.password, saltRounds);
                        }
                        const userData = user_data_transformer_helper_1.UserDataTransformer.transformCreateDto(dto, hashedPassword);
                        const newUser = new this.userModel(userData);
                        const savedUser = await newUser.save();
                        if (savedUser.roles && savedUser.roles.includes('student')) {
                            await this.pointLogsService.create({
                                studentId: savedUser._id.toString(),
                                points: 100,
                                type: point_log_entity_1.PointType.REWARD,
                                category: 'Initial Setup',
                                description: 'Welcome bonus - starting points for new student',
                                addedBy: 'system',
                                academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                            });
                        }
                        const userResponse = savedUser.toObject();
                        delete userResponse.password;
                        created.push(userResponse);
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        errors.push({
                            index: i,
                            nisn: dto.nisn || 'N/A',
                            error: errorMessage
                        });
                    }
                }
                return { created, errors };
            }, 'createBulkUsers');
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
        finally {
            try {
                await this.cacheHelper.invalidateUsersListCache();
                this.performanceService.endTimer(timerId, {
                    success: true,
                    created: created.length,
                    errors: errors.length
                });
            }
            catch (cacheError) {
                console.warn('Cache invalidation failed:', cacheError);
            }
        }
    }
    async update(id, updateUserDto) {
        const timerId = `updateUser-${Date.now()}`;
        this.performanceService.startTimer(timerId, { userId: id });
        try {
            user_validation_helper_1.UserValidationHelper.validateUserId(id);
            const dbStartTime = Date.now();
            const existingUser = await this.userModel.findById(id).exec();
            const dbDuration = Date.now() - dbStartTime;
            this.performanceService.trackDatabaseOperation('findById', 'users', dbDuration, {
                userId: id,
                found: !!existingUser,
            });
            if (!existingUser) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
                throw new common_1.NotFoundException('User not found');
            }
            if (updateUserDto.nisn) {
                updateUserDto.nisn = updateUserDto.nisn.trim();
            }
            if (updateUserDto.nisn && updateUserDto.nisn !== existingUser.nisn) {
                const nisnCheckStart = Date.now();
                const nisnConflict = await this.userModel.findOne({
                    nisn: updateUserDto.nisn,
                    _id: { $ne: id }
                }).exec();
                const nisnCheckDuration = Date.now() - nisnCheckStart;
                this.performanceService.trackDatabaseOperation('findOne', 'users', nisnCheckDuration, {
                    nisn: updateUserDto.nisn,
                    conflict: !!nisnConflict,
                });
                if (nisnConflict) {
                    this.performanceService.endTimer(timerId, { error: true, reason: 'nisn_conflict' });
                    const errorResponse = this.errorResponseService.createDuplicateResourceError('User', 'nisn', updateUserDto.nisn);
                    throw new common_1.ConflictException(errorResponse);
                }
            }
            const updateData = user_data_transformer_helper_1.UserDataTransformer.transformUpdateDto(updateUserDto);
            const updateStartTime = Date.now();
            const updatedUser = await this.userModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .select('-password')
                .exec();
            const updateDuration = Date.now() - updateStartTime;
            this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
                userId: id,
                updated: !!updatedUser,
            });
            if (!updatedUser) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'update_failed' });
                throw new common_1.NotFoundException('User not found after update');
            }
            await this.auditService.log('system', audit_action_enum_1.AuditAction.USER_UPDATED, 'User', id, {
                updatedFields: Object.keys(updateData),
                previousValues: {
                    name: existingUser.firstName && existingUser.lastName ? `${existingUser.firstName} ${existingUser.lastName}`.trim() : undefined,
                    points: existingUser.points,
                    classId: existingUser.classId
                },
                newValues: updateData
            });
            await this.cacheHelper.invalidateUserCache(id);
            await this.cacheHelper.invalidateUsersListCache();
            this.performanceService.endTimer(timerId, { success: true, userId: id });
            return updatedUser;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
    async archive(id) {
        const timerId = `archiveUser-${Date.now()}`;
        this.performanceService.startTimer(timerId, { userId: id });
        try {
            user_validation_helper_1.UserValidationHelper.validateUserId(id);
            const updateStartTime = Date.now();
            const archivedUser = await this.userModel
                .findByIdAndUpdate(id, { isArchived: true }, { new: true })
                .select('-password')
                .populate('classId', 'name')
                .exec();
            const updateDuration = Date.now() - updateStartTime;
            this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
                userId: id,
                archived: !!archivedUser,
            });
            if (!archivedUser) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
                throw new common_1.NotFoundException('User not found');
            }
            await this.cacheHelper.invalidateUserCache(id);
            await this.cacheHelper.invalidateUsersListCache();
            this.performanceService.endTimer(timerId, { success: true, userId: id });
            return archivedUser;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
    async restore(id) {
        const timerId = `restoreUser-${Date.now()}`;
        this.performanceService.startTimer(timerId, { userId: id });
        try {
            user_validation_helper_1.UserValidationHelper.validateUserId(id);
            const updateStartTime = Date.now();
            const restoredUser = await this.userModel
                .findByIdAndUpdate(id, { isArchived: false }, { new: true })
                .select('-password')
                .populate('classId', 'name')
                .exec();
            const updateDuration = Date.now() - updateStartTime;
            this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
                userId: id,
                restored: !!restoredUser,
            });
            if (!restoredUser) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
                throw new common_1.NotFoundException('User not found');
            }
            await this.cacheHelper.invalidateUserCache(id);
            await this.cacheHelper.invalidateUsersListCache();
            this.performanceService.endTimer(timerId, { success: true, userId: id });
            return restoredUser;
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
    async remove(id) {
        const timerId = `removeUser-${Date.now()}`;
        this.performanceService.startTimer(timerId, { userId: id });
        try {
            user_validation_helper_1.UserValidationHelper.validateUserId(id);
            const dbStartTime = Date.now();
            const res = await this.userModel.findByIdAndDelete(id).exec();
            const dbDuration = Date.now() - dbStartTime;
            this.performanceService.trackDatabaseOperation('findByIdAndDelete', 'users', dbDuration, {
                userId: id,
                deleted: !!res,
            });
            if (!res) {
                this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
                throw new common_1.NotFoundException('User not found');
            }
            await this.cacheHelper.invalidateUserCache(id);
            await this.cacheHelper.invalidateUsersListCache();
            this.performanceService.endTimer(timerId, { success: true, userId: id });
        }
        catch (error) {
            this.performanceService.endTimer(timerId, { error: true });
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection,
        cache_service_1.CacheService,
        performance_service_1.PerformanceService,
        error_response_service_1.ErrorResponseService,
        point_logs_service_1.PointLogsService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map