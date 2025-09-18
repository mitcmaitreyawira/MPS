import { OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
export declare class DevLockService implements OnModuleInit {
    private connection;
    private configService;
    private readonly logger;
    private readonly lockTTL;
    private lockRefreshInterval?;
    private instanceId;
    private isLockAcquired;
    constructor(connection: Connection, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private acquireLock;
    private startLockRefresh;
    private setupCleanupHandlers;
    private redactCredentials;
    isLockHeld(): boolean;
    getInstanceId(): string;
}
//# sourceMappingURL=dev-lock.service.d.ts.map