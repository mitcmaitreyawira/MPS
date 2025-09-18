import { Document, Types } from 'mongoose';
export declare class Notification extends Document {
    userId: Types.ObjectId;
    message: string;
    isRead: boolean;
    timestamp: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notification> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
//# sourceMappingURL=notification.schema.d.ts.map