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
var DataSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSyncService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
const class_schema_1 = require("../../database/schemas/class.schema");
const sync_operation_schema_1 = require("../../database/schemas/sync-operation.schema");
const cache_service_1 = require("../../common/services/cache.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let DataSyncService = DataSyncService_1 = class DataSyncService {
    connection;
    userModel;
    classModel;
    syncOperationModel;
    cacheService;
    auditService;
    logger = new common_1.Logger(DataSyncService_1.name);
    MAX_RETRIES = 3;
    PROCESSING_TIMEOUT = 30 * 60 * 1000;
    constructor(connection, userModel, classModel, syncOperationModel, cacheService, auditService) {
        this.connection = connection;
        this.userModel = userModel;
        this.classModel = classModel;
        this.syncOperationModel = syncOperationModel;
        this.cacheService = cacheService;
        this.auditService = auditService;
    }
    async onModuleInit() {
        await this.recoverProcessingOperations();
        this.startQueueProcessor();
    }
    async recoverProcessingOperations() {
        try {
            await this.syncOperationModel.updateMany({
                status: 'processing',
                lastProcessed: { $lt: new Date(Date.now() - this.PROCESSING_TIMEOUT) }
            }, {
                status: 'pending',
                $unset: { lastProcessed: 1 }
            });
            this.logger.log('Recovered processing operations on startup');
        }
        catch (error) {
            this.logger.error('Failed to recover processing operations', error);
        }
    }
    startQueueProcessor() {
        setInterval(() => {
            this.processSyncQueue().catch(error => {
                this.logger.error('Queue processor error', error);
            });
        }, 30000);
    }
    async executeSyncOperation(operation, entity, action) {
        const operationId = this.generateOperationId();
        const syncOp = await this.syncOperationModel.create({
            operationId,
            type: action,
            entity,
            data: {},
            status: 'processing',
            retries: 0,
            maxRetries: this.MAX_RETRIES,
            lastProcessed: new Date(),
        });
        try {
            let result;
            let affectedCount = 0;
            result = await operation();
            if (Array.isArray(result)) {
                affectedCount = result.length;
            }
            else if (result && typeof result === 'object') {
                affectedCount = 1;
            }
            await this.invalidateRelatedCaches(entity);
            await this.auditService.create({
                action: 'data_sync',
                details: {
                    operationId,
                    entity,
                    affectedCount,
                    success: true,
                },
            }, 'system', 'System Sync');
            await this.syncOperationModel.findOneAndUpdate({ operationId }, {
                status: 'completed',
                completedAt: new Date(),
                $unset: { lastProcessed: 1 }
            });
            return {
                success: true,
                operationId,
                entity,
                action,
                affectedCount,
                timestamp: new Date(),
                details: result,
            };
        }
        catch (error) {
            this.logger.error(`Sync operation failed: ${operationId}`, error);
            const updateData = {
                error: error.message,
                $unset: { lastProcessed: 1 }
            };
            if (syncOp.retries < this.MAX_RETRIES) {
                updateData.status = 'pending';
                updateData.$inc = { retries: 1 };
            }
            else {
                updateData.status = 'failed';
            }
            await this.syncOperationModel.findOneAndUpdate({ operationId }, updateData);
            return {
                success: false,
                operationId,
                entity,
                action,
                affectedCount: 0,
                timestamp: new Date(),
                error: error.message,
            };
        }
    }
    async checkDataIntegrity() {
        const issues = [];
        const orphanedUsers = await this.findOrphanedUserReferences();
        if (orphanedUsers.length > 0) {
            issues.push({
                type: 'orphaned_reference',
                entity: 'User',
                severity: 'high',
                description: 'Users referencing non-existent classes',
                affectedIds: orphanedUsers,
                suggestedFix: 'Set classId to null or assign to valid class',
                canAutoFix: true,
            });
        }
        const invalidHeadTeachers = await this.findInvalidHeadTeachers();
        if (invalidHeadTeachers.length > 0) {
            issues.push({
                type: 'invalid_reference',
                entity: 'Class',
                severity: 'high',
                description: 'Classes with non-existent head teachers',
                affectedIds: invalidHeadTeachers.map(c => c.toString()),
                suggestedFix: 'Unset headTeacherId or assign a valid teacher',
                canAutoFix: true,
            });
        }
        const duplicates = await this.findDuplicateEntries();
        for (const dup of duplicates) {
            issues.push({
                type: 'duplicate_entry',
                entity: dup.entity,
                severity: 'medium',
                description: dup.description,
                affectedIds: dup.ids,
                suggestedFix: 'Merge or remove duplicate entries',
                canAutoFix: false,
            });
        }
        const inconsistencies = await this.findDataInconsistencies();
        issues.push(...inconsistencies);
        return {
            timestamp: new Date(),
            issues,
            fixedCount: 0,
            pendingCount: issues.length,
        };
    }
    async autoFixIntegrityIssues(report) {
        let fixedCount = 0;
        const stillPending = [];
        for (const issue of report.issues) {
            if (!issue.canAutoFix) {
                stillPending.push(issue);
                continue;
            }
            try {
                const fixed = await this.fixIntegrityIssue(issue);
                if (fixed) {
                    fixedCount++;
                }
                else {
                    stillPending.push(issue);
                }
            }
            catch (error) {
                this.logger.error(`Failed to auto-fix issue: ${issue.type}`, error);
                stillPending.push(issue);
            }
        }
        return {
            timestamp: new Date(),
            issues: stillPending,
            fixedCount,
            pendingCount: stillPending.length,
        };
    }
    async fixIntegrityIssue(issue) {
        const session = await this.connection.startSession();
        try {
            let fixed = false;
            await session.withTransaction(async () => {
                switch (issue.type) {
                    case 'orphaned_reference':
                        if (issue.entity === 'User') {
                            await this.userModel.updateMany({ _id: { $in: issue.affectedIds }, classId: { $ne: null } }, { $unset: { classId: 1 } }, { session });
                            fixed = true;
                        }
                        break;
                    case 'invalid_reference':
                        if (issue.entity === 'Class') {
                            await this.classModel.updateMany({ _id: { $in: issue.affectedIds } }, { $unset: { headTeacherId: 1 } }, { session });
                            fixed = true;
                        }
                        break;
                }
            });
            if (fixed) {
                await this.auditService.create({
                    action: 'integrity_auto_fix',
                    details: {
                        issueType: issue.type,
                        entity: issue.entity,
                        affectedCount: issue.affectedIds.length,
                    },
                }, 'system', 'System Auto-Fix');
            }
            return fixed;
        }
        catch (error) {
            this.logger.error(`Failed to fix integrity issue: ${issue.type}`, error);
            return false;
        }
        finally {
            await session.endSession();
        }
    }
    async findOrphanedUserReferences() {
        const pipeline = [
            {
                $match: { classId: { $ne: null } },
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class',
                },
            },
            {
                $match: { class: { $size: 0 } },
            },
            {
                $project: { _id: 1 },
            },
        ];
        const results = await this.userModel.aggregate(pipeline);
        return results.map(r => r._id.toString());
    }
    async findInvalidHeadTeachers() {
        const pipeline = [
            {
                $match: { headTeacherId: { $ne: null } },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'headTeacherId',
                    foreignField: '_id',
                    as: 'teacher',
                },
            },
            {
                $match: { teacher: { $size: 0 } },
            },
            {
                $project: { _id: 1 },
            },
        ];
        const results = await this.classModel.aggregate(pipeline);
        return results.map(r => r._id.toString());
    }
    async findDuplicateEntries() {
        const duplicates = [];
        const dupClasses = await this.classModel.aggregate([
            {
                $group: {
                    _id: { $toLower: '$name' },
                    count: { $sum: 1 },
                    ids: { $push: '$_id' },
                },
            },
            {
                $match: { count: { $gt: 1 } },
            },
        ]);
        for (const dup of dupClasses) {
            duplicates.push({
                entity: 'Class',
                description: `Duplicate class name: ${dup._id}`,
                ids: dup.ids.map(id => id.toString()),
            });
        }
        const dupUsers = await this.userModel.aggregate([
            {
                $group: {
                    _id: { $toLower: '$email' },
                    count: { $sum: 1 },
                    ids: { $push: '$_id' },
                },
            },
            {
                $match: { count: { $gt: 1 } },
            },
        ]);
        for (const dup of dupUsers) {
            duplicates.push({
                entity: 'User',
                description: `Duplicate email: ${dup._id}`,
                ids: dup.ids.map(id => id.toString()),
            });
        }
        return duplicates;
    }
    async findDataInconsistencies() {
        const issues = [];
        return issues;
    }
    async checkAdditionalIntegrity() {
        const issues = [];
        return issues;
    }
    async invalidateRelatedCaches(entity) {
        const patterns = {
            User: ['user:*', 'dashboard:*'],
            Class: ['class:*', 'dashboard:*'],
        };
        const patternsToInvalidate = patterns[entity] || [`${entity.toLowerCase()}:*`];
        for (const pattern of patternsToInvalidate) {
            try {
                await this.cacheService.deletePattern(pattern);
            }
            catch (err) {
                this.logger.warn(`Failed to invalidate cache pattern ${pattern}: ${err.message}`);
            }
        }
    }
    async getSyncQueueStatus() {
        const [pendingOps, processingOps] = await Promise.all([
            this.syncOperationModel.find({ status: 'pending' }).lean(),
            this.syncOperationModel.find({ status: 'processing' }).lean(),
        ]);
        return {
            pending: pendingOps.length,
            processing: processingOps.length,
            operations: [...pendingOps, ...processingOps].map(op => ({
                operationId: op.operationId,
                type: op.type,
                entity: op.entity,
                data: op.data,
                timestamp: op.timestamp,
                status: op.status,
                retries: op.retries,
                error: op.error,
                maxRetries: op.maxRetries,
                metadata: op.metadata,
            })),
        };
    }
    async processSyncQueue() {
        try {
            const pendingOps = await this.syncOperationModel
                .find({ status: 'pending' })
                .sort({ timestamp: 1 })
                .limit(10)
                .lean();
            for (const operation of pendingOps) {
                try {
                    await this.retrySyncOperation(operation);
                }
                catch (error) {
                    this.logger.error(`Failed to process sync operation: ${operation.operationId}`, error);
                }
            }
        }
        catch (error) {
            this.logger.error('Error processing sync queue', error);
        }
    }
    async retrySyncOperation(operation) {
        try {
            await this.syncOperationModel.findOneAndUpdate({ operationId: operation.operationId, status: 'pending' }, {
                status: 'processing',
                lastProcessed: new Date()
            });
            this.logger.log(`Retrying sync operation: ${operation.operationId}`);
            await this.syncOperationModel.findOneAndUpdate({ operationId: operation.operationId }, {
                status: 'completed',
                completedAt: new Date(),
                $unset: { lastProcessed: 1 }
            });
        }
        catch (error) {
            await this.syncOperationModel.findOneAndUpdate({ operationId: operation.operationId }, {
                status: 'failed',
                error: error.message,
                $unset: { lastProcessed: 1 }
            });
            throw error;
        }
    }
    generateOperationId() {
        return `sync_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
};
exports.DataSyncService = DataSyncService;
exports.DataSyncService = DataSyncService = DataSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(class_schema_1.Class.name)),
    __param(3, (0, mongoose_1.InjectModel)(sync_operation_schema_1.SyncOperation.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        cache_service_1.CacheService,
        audit_logs_service_1.AuditLogsService])
], DataSyncService);
//# sourceMappingURL=data-sync.service.js.map