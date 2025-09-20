import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class DevLockService implements OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly lockFilePath;
    private readonly redisClient;
    private readonly lockKey;
    private readonly lockTTL;
    private lockRefreshInterval;
    private isLocked;
    constructor(configService: ConfigService);
    acquireLock(): Promise<void>;
    private checkPortAvailability;
    private acquirePidLock;
    private acquireRedisMutex;
    private isProcessRunning;
    private releasePidLock;
    private releaseRedisMutex;
    onModuleDestroy(): Promise<void>;
    getLockStatus(): {
        enabled: boolean;
        locked: boolean;
        pid: number;
        lockFile: string;
        redisAvailable: boolean;
    };
}
//# sourceMappingURL=devlock.service.d.ts.map