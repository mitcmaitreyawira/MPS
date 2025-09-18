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
var DevLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevLockService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
let DevLockService = DevLockService_1 = class DevLockService {
    connection;
    configService;
    logger = new common_1.Logger(DevLockService_1.name);
    lockTTL = 30000;
    lockRefreshInterval;
    instanceId;
    isLockAcquired = false;
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
        this.instanceId = `${process.pid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async onModuleInit() {
        const nodeEnv = this.configService.get('app.env', 'development');
        const devLockEnabled = process.env.DEV_SINGLE_BACKEND_LOCK !== 'false';
        if (nodeEnv === 'development' && devLockEnabled) {
            await this.acquireLock();
        }
        else {
            this.logger.log('Dev lock disabled (production environment or DEV_SINGLE_BACKEND_LOCK=false)');
        }
    }
    async acquireLock() {
        try {
            const db = this.connection.db;
            if (!db) {
                throw new Error('Database connection not available');
            }
            const locksCollection = db.collection('instanceLocks');
            try {
                await locksCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
            }
            catch (indexError) {
            }
            const mongoUri = this.configService.get('database.uri');
            const dbName = db.databaseName;
            const lockKey = `backend-${dbName}`;
            const now = new Date();
            const expiresAt = new Date(now.getTime() + this.lockTTL);
            const result = await locksCollection.findOneAndUpdate({
                _id: lockKey,
                $or: [
                    { expiresAt: { $lt: now } },
                    { instanceId: this.instanceId }
                ]
            }, {
                $set: {
                    instanceId: this.instanceId,
                    acquiredAt: now,
                    expiresAt: expiresAt,
                    mongoUri: this.redactCredentials(mongoUri || ''),
                    pid: process.pid,
                    nodeVersion: process.version,
                    platform: process.platform
                }
            }, { upsert: true, returnDocument: 'after' });
            if (result && result.instanceId === this.instanceId) {
                this.isLockAcquired = true;
                this.logger.log(`🔒 Dev lock acquired for database: ${dbName} (instance: ${this.instanceId})`);
                this.startLockRefresh(locksCollection, lockKey);
                this.setupCleanupHandlers(locksCollection, lockKey);
            }
            else {
                const existingLock = await locksCollection.findOne({ _id: lockKey });
                if (existingLock) {
                    const errorMessage = [
                        '🚫 Another backend instance is already running for this database.',
                        `   Database: ${dbName}`,
                        `   Lock held by instance: ${existingLock.instanceId}`,
                        `   Lock acquired at: ${existingLock.acquiredAt}`,
                        `   PID: ${existingLock.pid}`,
                        '',
                        '   Solutions:',
                        '   1. Stop the other backend instance',
                        '   2. Set DEV_SINGLE_BACKEND_LOCK=false to disable this check',
                        '   3. Use a different database for this instance',
                        ''
                    ].join('\n');
                    this.logger.error(errorMessage);
                    process.exit(1);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to acquire dev lock:', error);
            process.exit(1);
        }
    }
    startLockRefresh(locksCollection, lockKey) {
        this.lockRefreshInterval = setInterval(async () => {
            try {
                const now = new Date();
                const expiresAt = new Date(now.getTime() + this.lockTTL);
                await locksCollection.updateOne({ _id: lockKey, instanceId: this.instanceId }, { $set: { expiresAt: expiresAt, lastRefreshed: now } });
                this.logger.debug(`🔄 Dev lock refreshed for instance: ${this.instanceId}`);
            }
            catch (error) {
                this.logger.warn('Failed to refresh dev lock:', error);
            }
        }, this.lockTTL / 2);
    }
    setupCleanupHandlers(locksCollection, lockKey) {
        const cleanup = async () => {
            if (this.isLockAcquired) {
                try {
                    await locksCollection.deleteOne({ _id: lockKey, instanceId: this.instanceId });
                    this.logger.log(`🔓 Dev lock released for instance: ${this.instanceId}`);
                }
                catch (error) {
                    this.logger.warn('Failed to release dev lock during cleanup:', error);
                }
            }
            if (this.lockRefreshInterval) {
                clearInterval(this.lockRefreshInterval);
            }
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
        process.on('uncaughtException', async (error) => {
            this.logger.error('Uncaught exception, cleaning up dev lock:', error);
            await cleanup();
            process.exit(1);
        });
    }
    redactCredentials(uri) {
        try {
            return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
        }
        catch {
            return 'mongodb://***:***@***';
        }
    }
    isLockHeld() {
        return this.isLockAcquired;
    }
    getInstanceId() {
        return this.instanceId;
    }
};
exports.DevLockService = DevLockService;
exports.DevLockService = DevLockService = DevLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        config_1.ConfigService])
], DevLockService);
//# sourceMappingURL=dev-lock.service.js.map