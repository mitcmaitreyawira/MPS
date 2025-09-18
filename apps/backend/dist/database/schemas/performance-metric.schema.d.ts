import { Document } from 'mongoose';
export type PerformanceMetricDocument = PerformanceMetric & Document;
export declare class PerformanceMetric {
    metricType: string;
    operation: string;
    duration: number;
    timestamp: Date;
    metadata?: {
        method?: string;
        statusCode?: number;
        userId?: string;
        endpoint?: string;
        query?: string;
        error?: boolean;
        cacheHit?: boolean;
        found?: boolean;
        [key: string]: any;
    };
    sessionId?: string;
    correlationId?: string;
    isError: boolean;
    errorMessage?: string;
}
export declare const PerformanceMetricSchema: import("mongoose").Schema<PerformanceMetric, import("mongoose").Model<PerformanceMetric, any, any, any, Document<unknown, any, PerformanceMetric, any, {}> & PerformanceMetric & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PerformanceMetric, Document<unknown, {}, import("mongoose").FlatRecord<PerformanceMetric>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PerformanceMetric> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class RequestTimer {
    timerId: string;
    operation: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    status: 'active' | 'completed' | 'abandoned';
    metadata?: {
        [key: string]: any;
    };
}
export declare const RequestTimerSchema: import("mongoose").Schema<RequestTimer, import("mongoose").Model<RequestTimer, any, any, any, Document<unknown, any, RequestTimer, any, {}> & RequestTimer & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RequestTimer, Document<unknown, {}, import("mongoose").FlatRecord<RequestTimer>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RequestTimer> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type RequestTimerDocument = RequestTimer & Document;
//# sourceMappingURL=performance-metric.schema.d.ts.map