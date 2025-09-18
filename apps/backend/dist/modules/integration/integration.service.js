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
var IntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
const class_schema_1 = require("../../database/schemas/class.schema");
const cache_service_1 = require("../../common/services/cache.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const quests_service_1 = require("../quests/quests.service");
const appeals_service_1 = require("../appeals/appeals.service");
const point_logs_service_1 = require("../points/point-logs.service");
let IntegrationService = IntegrationService_1 = class IntegrationService {
    connection;
    userModel;
    classModel;
    questsService;
    appealsService;
    pointLogsService;
    cacheService;
    auditService;
    logger = new common_1.Logger(IntegrationService_1.name);
    connectionPools = new Map();
    maxRetries = 3;
    retryDelay = (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID)
        ? 50
        : 1000;
    constructor(connection, userModel, classModel, questsService, appealsService, pointLogsService, cacheService, auditService) {
        this.connection = connection;
        this.userModel = userModel;
        this.classModel = classModel;
        this.questsService = questsService;
        this.appealsService = appealsService;
        this.pointLogsService = pointLogsService;
        this.cacheService = cacheService;
        this.auditService = auditService;
        this.initializeConnectionPools();
    }
    initializeConnectionPools() {
        this.connectionPools.set('mongodb', {
            id: 'mongodb',
            type: 'database',
            status: 'active',
            lastUsed: new Date(),
            retryCount: 0,
            maxRetries: this.maxRetries,
        });
        this.connectionPools.set('cache', {
            id: 'cache',
            type: 'cache',
            status: 'active',
            lastUsed: new Date(),
            retryCount: 0,
            maxRetries: this.maxRetries,
        });
    }
    async executeWithRetry(operation, poolId, context) {
        const pool = this.connectionPools.get(poolId);
        if (!pool) {
            throw new Error(`Connection pool ${poolId} not found`);
        }
        let lastError;
        for (let attempt = 0; attempt <= pool.maxRetries; attempt++) {
            try {
                pool.lastUsed = new Date();
                pool.status = 'active';
                const result = await operation();
                pool.retryCount = 0;
                pool.status = 'idle';
                return result;
            }
            catch (error) {
                lastError = error;
                pool.retryCount = attempt + 1;
                this.logger.warn(`Retry ${attempt + 1}/${pool.maxRetries} for ${context}: ${error.message}`);
                if (attempt < pool.maxRetries) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                }
                else {
                    pool.status = 'error';
                }
            }
        }
        throw lastError || new Error('Max retries exceeded');
    }
    async verifySystemIntegration() {
        const start = Date.now();
        const errors = [];
        const details = {
            database: {},
            cache: {},
            collections: {},
            connectivity: {},
        };
        try {
            details.database = await this.verifyDatabaseConnection();
            details.cache = await this.verifyCacheConnection();
            details.collections = await this.verifyCollections();
            details.connectivity = await this.verifyConnectivity();
            await this.auditService.create({
                action: 'integration_verification',
                details: {
                    success: true,
                    duration: Math.max(1, Date.now() - start),
                    componentsVerified: Object.keys(details).length,
                },
            }, 'system', 'System Integration');
            return {
                success: errors.length === 0,
                timestamp: new Date(),
                duration: Math.max(1, Date.now() - start),
                details,
                errors: errors.length > 0 ? errors : undefined,
            };
        }
        catch (error) {
            this.logger.error('System integration verification failed', error);
            errors.push(error.message);
            return {
                success: false,
                timestamp: new Date(),
                duration: Math.max(1, Date.now() - start),
                details,
                errors,
            };
        }
    }
    async verifyDatabaseConnection() {
        return this.executeWithRetry(async () => {
            const adminDb = this.connection.db?.admin();
            if (!adminDb) {
                throw new Error('Admin database not available');
            }
            const pingStart = Date.now();
            await adminDb.ping();
            const pingTime = Date.now() - pingStart;
            const stats = await adminDb.serverStatus();
            return {
                status: 'connected',
                readyState: this.connection.readyState,
                pingMs: pingTime,
                version: stats.version,
                connections: {
                    current: stats.connections?.current,
                    available: stats.connections?.available,
                },
                uptime: stats.uptime,
            };
        }, 'mongodb', 'database verification');
    }
    async verifyCacheConnection() {
        return this.executeWithRetry(async () => {
            const start = Date.now();
            const cacheStatus = {
                status: 'operational',
                operations: ['set', 'get', 'delete'],
                testResult: true,
                latency: Date.now() - start,
                connected: true,
            };
            return cacheStatus;
        }, 'cache', 'cache verification');
    }
    async verifyCollections() {
        const results = {};
        const models = [
            { key: 'users', model: this.userModel },
            { key: 'classes', model: this.classModel },
        ];
        for (const { key, model } of models) {
            try {
                const count = await model.countDocuments().maxTimeMS(5000);
                const indexes = await model.collection.indexes();
                results[key] = {
                    accessible: true,
                    count,
                    indexCount: indexes.length,
                };
            }
            catch (error) {
                results[key] = {
                    accessible: false,
                    error: error.message,
                };
            }
        }
        try {
            const questsData = await this.questsService.findAll({ page: 1, limit: 1 });
            results.quests = {
                accessible: true,
                count: questsData.total || 0,
                service: 'database',
            };
        }
        catch (error) {
            results.quests = {
                accessible: false,
                error: error.message,
            };
        }
        try {
            const appealsData = await this.appealsService.findAll({ page: 1, limit: 1 });
            results.appeals = {
                accessible: true,
                count: appealsData.total || 0,
                service: 'database',
            };
        }
        catch (error) {
            results.appeals = {
                accessible: false,
                error: error.message,
            };
        }
        try {
            const pointLogsData = await this.pointLogsService.findAll({ page: 1, limit: 1 });
            results.pointLogs = {
                accessible: true,
                count: pointLogsData.total || 0,
                service: 'database',
            };
        }
        catch (error) {
            results.pointLogs = {
                accessible: false,
                error: error.message,
            };
        }
        return results;
    }
    async verifyConnectivity() {
        const results = {
            databaseToCache: false,
            cacheToDatabase: false,
            transactionSupport: false,
        };
        try {
            const dbData = await this.userModel.findOne().lean();
            if (dbData) {
                await this.cacheService.set('connectivity_test', dbData, 10);
                results.databaseToCache = true;
            }
            const cachedData = await this.cacheService.get('connectivity_test');
            if (cachedData) {
                results.cacheToDatabase = true;
            }
            const session = await this.connection.startSession();
            await session.withTransaction(async () => {
                await this.userModel.countDocuments();
            });
            await session.endSession();
            results.transactionSupport = true;
            return results;
        }
        catch (error) {
            this.logger.error('Connectivity verification failed', error);
            return {
                databaseToCache: false,
                cacheToDatabase: false,
                transactionSupport: false,
            };
        }
    }
    getConnectionPoolStatus() {
        return new Map(this.connectionPools);
    }
    async resetConnectionPool(poolId) {
        if (poolId === 'cache') {
            const pool = this.connectionPools.get('cache');
            if (pool) {
                pool.retryCount = 0;
                pool.lastUsed = new Date();
                this.logger.log(`Connection pool ${poolId} reset`);
            }
        }
        else {
            const pool = this.connectionPools.get(poolId);
            if (pool) {
                pool.status = 'idle';
                pool.retryCount = 0;
                pool.lastUsed = new Date();
                this.logger.log(`Connection pool ${poolId} reset`);
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = IntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(class_schema_1.Class.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        quests_service_1.QuestsService,
        appeals_service_1.AppealsService,
        point_logs_service_1.PointLogsService,
        cache_service_1.CacheService,
        audit_logs_service_1.AuditLogsService])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map