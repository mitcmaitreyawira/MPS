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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("../../database/schemas/notification.schema");
const logger_service_1 = require("../../common/services/logger.service");
const performance_service_1 = require("../../common/services/performance.service");
let NotificationsService = class NotificationsService {
    notificationModel;
    logger;
    performanceService;
    constructor(notificationModel, logger, performanceService) {
        this.notificationModel = notificationModel;
        this.logger = logger;
        this.performanceService = performanceService;
    }
    async findAll(query) {
        const timerId = `findAllNotifications_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const { page = 1, limit = 10, userId, isRead, search, sortBy = 'timestamp', sortOrder = 'desc' } = query;
            const skip = (page - 1) * limit;
            const filter = {};
            if (userId) {
                filter.userId = userId;
            }
            if (isRead !== undefined) {
                filter.isRead = isRead;
            }
            if (search) {
                filter.message = { $regex: search, $options: 'i' };
            }
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const [notifications, total] = await Promise.all([
                this.notificationModel
                    .find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'name nisn')
                    .exec(),
                this.notificationModel.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(total / limit);
            this.performanceService.endTimer(timerId);
            this.logger.log('Notifications retrieved successfully', {
                metadata: {
                    query,
                    total,
                    page,
                    totalPages,
                },
            });
            return {
                data: notifications,
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
            this.logger.error('Failed to retrieve notifications', error instanceof Error ? error.stack : String(error), {
                metadata: { query },
            });
            throw error;
        }
    }
    async findOne(id) {
        const timerId = `findOneNotification_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const notification = await this.notificationModel
                .findById(id)
                .populate('userId', 'name nisn')
                .exec();
            if (!notification) {
                throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId);
            this.logger.log('Notification retrieved successfully', {
                metadata: { id },
            });
            return notification;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to retrieve notification', error instanceof Error ? error.stack : String(error), {
                metadata: { id },
            });
            throw error;
        }
    }
    async create(createNotificationDto) {
        const timerId = `createNotification_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const notification = new this.notificationModel(createNotificationDto);
            const savedNotification = await notification.save();
            await savedNotification.populate('userId', 'name nisn');
            this.performanceService.endTimer(timerId);
            this.logger.log('Notification created successfully', {
                metadata: {
                    createNotificationDto,
                    notificationId: savedNotification._id,
                },
            });
            return savedNotification;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to create notification', error instanceof Error ? error.stack : String(error), {
                metadata: { createNotificationDto },
            });
            throw error;
        }
    }
    async update(id, updateNotificationDto) {
        const timerId = `updateNotification_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const updatedNotification = await this.notificationModel
                .findByIdAndUpdate(id, updateNotificationDto, { new: true })
                .populate('userId', 'name nisn')
                .exec();
            if (!updatedNotification) {
                throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId);
            this.logger.log('Notification updated successfully', {
                metadata: {
                    id,
                    updateNotificationDto,
                },
            });
            return updatedNotification;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to update notification', error instanceof Error ? error.stack : String(error), {
                metadata: { id, updateNotificationDto },
            });
            throw error;
        }
    }
    async remove(id) {
        const timerId = `removeNotification_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const notification = await this.notificationModel.findById(id).exec();
            if (!notification) {
                throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
            }
            await this.notificationModel.findByIdAndDelete(id).exec();
            this.performanceService.endTimer(timerId);
            this.logger.log('Notification deleted successfully', {
                metadata: { id },
            });
            return { message: 'Notification deleted successfully' };
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to delete notification', error instanceof Error ? error.stack : String(error), {
                metadata: { id },
            });
            throw error;
        }
    }
    async markAsRead(id) {
        const timerId = `markNotificationAsRead_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const updatedNotification = await this.notificationModel
                .findByIdAndUpdate(id, { isRead: true }, { new: true })
                .populate('userId', 'name nisn')
                .exec();
            if (!updatedNotification) {
                throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
            }
            this.performanceService.endTimer(timerId);
            this.logger.log('Notification marked as read successfully', {
                metadata: { id },
            });
            return updatedNotification;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to mark notification as read', error instanceof Error ? error.stack : String(error), {
                metadata: { id },
            });
            throw error;
        }
    }
    async markAllAsReadForUser(userId) {
        const timerId = `markAllNotificationsAsRead_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const result = await this.notificationModel
                .updateMany({ userId, isRead: false }, { isRead: true })
                .exec();
            this.performanceService.endTimer(timerId);
            this.logger.log('All notifications marked as read for user', {
                metadata: {
                    userId,
                    modifiedCount: result.modifiedCount,
                },
            });
            return {
                message: 'All notifications marked as read successfully',
                modifiedCount: result.modifiedCount,
            };
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to mark all notifications as read for user', error instanceof Error ? error.stack : String(error), {
                metadata: { userId },
            });
            throw error;
        }
    }
    async getUnreadCount(userId) {
        const timerId = `getUnreadNotificationCount_${Date.now()}`;
        this.performanceService.startTimer(timerId);
        try {
            const count = await this.notificationModel
                .countDocuments({ userId, isRead: false })
                .exec();
            this.performanceService.endTimer(timerId);
            this.logger.log('Unread notification count retrieved successfully', {
                metadata: { userId, count },
            });
            return { count };
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to get unread notification count', error instanceof Error ? error.stack : String(error), {
                metadata: { userId },
            });
            throw error;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        logger_service_1.StructuredLoggerService,
        performance_service_1.PerformanceService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map