import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto, QueryNotificationsDto } from './dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas/notification.schema").Notification, {}, {}> & import("../../database/schemas/notification.schema").Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(query: QueryNotificationsDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../../database/schemas/notification.schema").Notification, {}, {}> & import("../../database/schemas/notification.schema").Notification & Required<{
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
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas/notification.schema").Notification, {}, {}> & import("../../database/schemas/notification.schema").Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas/notification.schema").Notification, {}, {}> & import("../../database/schemas/notification.schema").Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../database/schemas/notification.schema").Notification, {}, {}> & import("../../database/schemas/notification.schema").Notification & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    markAllAsReadForUser(userId: string): Promise<{
        message: string;
        modifiedCount: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notifications.controller.d.ts.map