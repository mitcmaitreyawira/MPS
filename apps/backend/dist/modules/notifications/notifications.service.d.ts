import { Model } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';
import { CreateNotificationDto, UpdateNotificationDto, QueryNotificationsDto } from './dto';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';
export declare class NotificationsService {
    private notificationModel;
    private readonly logger;
    private readonly performanceService;
    constructor(notificationModel: Model<Notification>, logger: StructuredLoggerService, performanceService: PerformanceService);
    findAll(query: QueryNotificationsDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, Notification, {}, {}> & Notification & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Notification, {}, {}> & Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    create(createNotificationDto: CreateNotificationDto): Promise<import("mongoose").Document<unknown, {}, Notification, {}, {}> & Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<import("mongoose").Document<unknown, {}, Notification, {}, {}> & Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, Notification, {}, {}> & Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    markAllAsReadForUser(userId: string): Promise<{
        message: string;
        modifiedCount: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=notifications.service.d.ts.map