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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../../common/services/logger.service");
const performance_service_1 = require("../../common/services/performance.service");
let AuditLogsService = class AuditLogsService {
    logger;
    performanceService;
    auditLogs = [];
    idCounter = 1;
    constructor(logger, performanceService) {
        this.logger = logger;
        this.performanceService = performanceService;
    }
    async create(createAuditLogDto, userId, userName) {
        const timerId = `audit-log-create-${Date.now()}`;
        this.performanceService.startTimer(timerId, { action: createAuditLogDto.action });
        try {
            const auditLog = {
                id: `log_${this.idCounter++}`,
                action: createAuditLogDto.action,
                userId,
                userName,
                details: createAuditLogDto.details || {},
                timestamp: new Date(),
            };
            this.auditLogs.push(auditLog);
            this.logger.log('Audit log created', {
                userId,
                metadata: {
                    auditLogId: auditLog.id,
                    action: auditLog.action,
                    details: auditLog.details,
                },
            });
            this.performanceService.endTimer(timerId, { auditLogId: auditLog.id });
            return auditLog;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to create audit log', error instanceof Error ? error.stack : String(error), {
                userId,
                metadata: { action: createAuditLogDto.action },
            });
            throw error;
        }
    }
    async findAll(query) {
        const timerId = `audit-logs-query-${Date.now()}`;
        this.performanceService.startTimer(timerId, { query });
        try {
            const { page = 1, limit = 10, action, userId } = query;
            let filteredLogs = [...this.auditLogs];
            if (action) {
                filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
            }
            if (userId) {
                filteredLogs = filteredLogs.filter(log => log.userId === userId);
            }
            filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const total = filteredLogs.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const logs = filteredLogs.slice(startIndex, endIndex);
            const result = {
                logs,
                total,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
            this.performanceService.endTimer(timerId, { resultCount: logs.length });
            return result;
        }
        catch (error) {
            this.performanceService.endTimer(timerId);
            this.logger.error('Failed to retrieve audit logs', error instanceof Error ? error.stack : String(error), {
                metadata: { query },
            });
            throw error;
        }
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.StructuredLoggerService,
        performance_service_1.PerformanceService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map