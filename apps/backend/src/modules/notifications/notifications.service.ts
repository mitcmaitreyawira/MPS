import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';
import { CreateNotificationDto, UpdateNotificationDto, QueryNotificationsDto } from './dto';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly logger: StructuredLoggerService,
    private readonly performanceService: PerformanceService,
  ) {}

  async findAll(query: QueryNotificationsDto) {
    const timerId = `findAllNotifications_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const { page = 1, limit = 10, userId, isRead, search, sortBy = 'timestamp', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter: any = {};
      
      if (userId) {
        filter.userId = userId;
      }
      
      if (isRead !== undefined) {
        filter.isRead = isRead;
      }
      
      if (search) {
        filter.message = { $regex: search, $options: 'i' };
      }

      // Build sort object
      const sort: any = {};
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
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to retrieve notifications', error instanceof Error ? error.stack : String(error), {
        metadata: { query },
      });
      throw error;
    }
  }

  async findOne(id: string) {
    const timerId = `findOneNotification_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const notification = await this.notificationModel
        .findById(id)
        .populate('userId', 'name nisn')
        .exec();

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId);
      this.logger.log('Notification retrieved successfully', {
        metadata: { id },
      });

      return notification;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to retrieve notification', error instanceof Error ? error.stack : String(error), {
        metadata: { id },
      });
      throw error;
    }
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const timerId = `createNotification_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const notification = new this.notificationModel(createNotificationDto);
      const savedNotification = await notification.save();

      // Populate the userId field
      await savedNotification.populate('userId', 'name nisn');

      this.performanceService.endTimer(timerId);
      this.logger.log('Notification created successfully', {
        metadata: {
          createNotificationDto,
          notificationId: savedNotification._id,
        },
      });

      return savedNotification;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to create notification', error instanceof Error ? error.stack : String(error), {
        metadata: { createNotificationDto },
      });
      throw error;
    }
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    const timerId = `updateNotification_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const updatedNotification = await this.notificationModel
        .findByIdAndUpdate(id, updateNotificationDto, { new: true })
        .populate('userId', 'name nisn')
        .exec();

      if (!updatedNotification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId);
      this.logger.log('Notification updated successfully', {
        metadata: {
          id,
          updateNotificationDto,
        },
      });

      return updatedNotification;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to update notification', error instanceof Error ? error.stack : String(error), {
        metadata: { id, updateNotificationDto },
      });
      throw error;
    }
  }

  async remove(id: string) {
    const timerId = `removeNotification_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const notification = await this.notificationModel.findById(id).exec();
      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      await this.notificationModel.findByIdAndDelete(id).exec();

      this.performanceService.endTimer(timerId);
      this.logger.log('Notification deleted successfully', {
        metadata: { id },
      });

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to delete notification', error instanceof Error ? error.stack : String(error), {
        metadata: { id },
      });
      throw error;
    }
  }

  async markAsRead(id: string) {
    const timerId = `markNotificationAsRead_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const updatedNotification = await this.notificationModel
        .findByIdAndUpdate(id, { isRead: true }, { new: true })
        .populate('userId', 'name nisn')
        .exec();

      if (!updatedNotification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId);
      this.logger.log('Notification marked as read successfully', {
        metadata: { id },
      });

      return updatedNotification;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to mark notification as read', error instanceof Error ? error.stack : String(error), {
        metadata: { id },
      });
      throw error;
    }
  }

  async markAllAsReadForUser(userId: string) {
    const timerId = `markAllNotificationsAsRead_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const result = await this.notificationModel
        .updateMany(
          { userId, isRead: false },
          { isRead: true }
        )
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
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to mark all notifications as read for user', error instanceof Error ? error.stack : String(error), {
        metadata: { userId },
      });
      throw error;
    }
  }

  async getUnreadCount(userId: string) {
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
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to get unread notification count', error instanceof Error ? error.stack : String(error), {
        metadata: { userId },
      });
      throw error;
    }
  }
}