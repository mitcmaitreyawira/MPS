"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DevLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevLockService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const net = __importStar(require("net"));
const ioredis_1 = require("ioredis");
let DevLockService = DevLockService_1 = class DevLockService {
    configService;
    logger = new common_1.Logger(DevLockService_1.name);
    lockFilePath;
    redisClient = null;
    lockKey = 'devlock:backend:instance';
    lockTTL = 30;
    lockRefreshInterval = null;
    isLocked = false;
    constructor(configService) {
        this.configService = configService;
        this.lockFilePath = path.join(process.cwd(), '.devlock.pid');
        try {
            const redisHost = this.configService.get('REDIS_HOST', 'localhost');
            const redisPort = this.configService.get('REDIS_PORT', 6379);
            const redisPassword = this.configService.get('REDIS_PASSWORD');
            this.redisClient = new ioredis_1.Redis({
                host: redisHost,
                port: redisPort,
                password: redisPassword,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });
        }
        catch (error) {
            this.logger.warn('Redis not available for DevLock mutex, continuing with port and PID checks only');
        }
    }
    async acquireLock() {
        const devlockEnabled = this.configService.get('DEVLOCK', 'true') === 'true';
        if (!devlockEnabled) {
            this.logger.log('DevLock is disabled via DEVLOCK=false');
            return;
        }
        this.logger.log('🔒 Acquiring DevLock...');
        await this.checkPortAvailability();
        await this.acquirePidLock();
        if (this.redisClient) {
            await this.acquireRedisMutex();
        }
        this.isLocked = true;
        this.logger.log('✅ DevLock acquired successfully');
    }
    async checkPortAvailability() {
        const port = this.configService.get('PORT', 3002);
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.close(() => {
                    this.logger.log(`✅ Port ${port} is available`);
                    resolve();
                });
            });
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    this.logger.error(`❌ Port ${port} is already in use. Another backend instance may be running.`);
                    this.logger.error('💡 Troubleshooting:');
                    this.logger.error(`   - Check what's using port ${port}: lsof -i :${port}`);
                    this.logger.error(`   - Kill the process: kill -9 <PID>`);
                    this.logger.error('   - Or disable DevLock temporarily: DEVLOCK=false');
                    reject(new Error(`Port ${port} is already in use`));
                }
                else {
                    reject(err);
                }
            });
        });
    }
    async acquirePidLock() {
        try {
            if (fs.existsSync(this.lockFilePath)) {
                const existingPid = fs.readFileSync(this.lockFilePath, 'utf8').trim();
                if (this.isProcessRunning(parseInt(existingPid))) {
                    this.logger.error(`❌ Another backend instance is running (PID: ${existingPid})`);
                    this.logger.error('💡 Troubleshooting:');
                    this.logger.error(`   - Kill the process: kill -9 ${existingPid}`);
                    this.logger.error(`   - Remove stale lockfile: rm ${this.lockFilePath}`);
                    this.logger.error('   - Or disable DevLock temporarily: DEVLOCK=false');
                    throw new Error(`Backend instance already running with PID ${existingPid}`);
                }
                else {
                    this.logger.warn(`🧹 Removing stale lockfile (PID ${existingPid} not running)`);
                    fs.unlinkSync(this.lockFilePath);
                }
            }
            fs.writeFileSync(this.lockFilePath, process.pid.toString());
            this.logger.log(`✅ PID lockfile created (PID: ${process.pid})`);
            process.on('exit', () => this.releasePidLock());
            process.on('SIGINT', () => {
                this.releasePidLock();
                process.exit(0);
            });
            process.on('SIGTERM', () => {
                this.releasePidLock();
                process.exit(0);
            });
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('already running')) {
                this.logger.error(`Failed to acquire PID lock: ${error.message}`);
                throw error;
            }
            throw error;
        }
    }
    async acquireRedisMutex() {
        if (!this.redisClient) {
            return;
        }
        try {
            await this.redisClient.connect();
            const result = await this.redisClient.set(this.lockKey, `${process.pid}:${Date.now()}`, 'EX', this.lockTTL, 'NX');
            if (result !== 'OK') {
                const existingLock = await this.redisClient.get(this.lockKey);
                this.logger.error(`❌ Redis mutex is held by another instance: ${existingLock}`);
                this.logger.error('💡 Troubleshooting:');
                this.logger.error('   - Wait for the lock to expire (30 seconds)');
                this.logger.error(`   - Force release: redis-cli DEL ${this.lockKey}`);
                this.logger.error('   - Or disable DevLock temporarily: DEVLOCK=false');
                throw new Error('Redis mutex already held by another instance');
            }
            this.logger.log('✅ Redis mutex acquired');
            this.lockRefreshInterval = setInterval(async () => {
                try {
                    await this.redisClient?.expire(this.lockKey, this.lockTTL);
                }
                catch (error) {
                    this.logger.warn('Failed to refresh Redis lock:', error);
                }
            }, (this.lockTTL * 1000) / 2);
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('already held')) {
                this.logger.warn(`Redis mutex unavailable: ${error.message}`);
                return;
            }
            throw error;
        }
    }
    isProcessRunning(pid) {
        try {
            process.kill(pid, 0);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    releasePidLock() {
        try {
            if (fs.existsSync(this.lockFilePath)) {
                fs.unlinkSync(this.lockFilePath);
                this.logger.log('🧹 PID lockfile released');
            }
        }
        catch (error) {
            this.logger.warn('Failed to release PID lockfile:', error);
        }
    }
    async releaseRedisMutex() {
        if (!this.redisClient || !this.isLocked) {
            return;
        }
        try {
            if (this.lockRefreshInterval) {
                clearInterval(this.lockRefreshInterval);
                this.lockRefreshInterval = null;
            }
            await this.redisClient.del(this.lockKey);
            this.logger.log('🧹 Redis mutex released');
        }
        catch (error) {
            this.logger.warn('Failed to release Redis mutex:', error);
        }
    }
    async onModuleDestroy() {
        if (!this.isLocked) {
            return;
        }
        this.logger.log('🔓 Releasing DevLock...');
        this.releasePidLock();
        await this.releaseRedisMutex();
        if (this.redisClient) {
            await this.redisClient.disconnect();
        }
        this.isLocked = false;
        this.logger.log('✅ DevLock released');
    }
    getLockStatus() {
        return {
            enabled: this.configService.get('DEVLOCK', 'true') === 'true',
            locked: this.isLocked,
            pid: process.pid,
            lockFile: this.lockFilePath,
            redisAvailable: this.redisClient !== null,
        };
    }
};
exports.DevLockService = DevLockService;
exports.DevLockService = DevLockService = DevLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DevLockService);
//# sourceMappingURL=devlock.service.js.map