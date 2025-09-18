"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPerformanceHelper = void 0;
class UserPerformanceHelper {
    performanceService;
    constructor(performanceService) {
        this.performanceService = performanceService;
    }
    startTimer(operation, metadata = {}) {
        const timerId = `${operation}-${Date.now()}`;
        this.performanceService.startTimer(timerId, metadata);
        return timerId;
    }
    endTimerSuccess(timerId, metadata = {}) {
        this.performanceService.endTimer(timerId, { success: true, ...metadata });
    }
    endTimerError(timerId, reason, metadata = {}) {
        this.performanceService.endTimer(timerId, { error: true, reason, ...metadata });
    }
    trackDatabaseOperation(operation, collection, startTime, metadata = {}) {
        const duration = Date.now() - startTime;
        this.performanceService.trackDatabaseOperation(operation, collection, duration, metadata);
    }
    async trackDbOperation(operation, collection, dbOperation, metadata = {}) {
        const startTime = Date.now();
        try {
            const result = await dbOperation();
            this.trackDatabaseOperation(operation, collection, startTime, {
                success: true,
                ...metadata,
            });
            return result;
        }
        catch (error) {
            this.trackDatabaseOperation(operation, collection, startTime, {
                error: true,
                ...metadata,
            });
            throw error;
        }
    }
}
exports.UserPerformanceHelper = UserPerformanceHelper;
//# sourceMappingURL=user-performance.helper.js.map