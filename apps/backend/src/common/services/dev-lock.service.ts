import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

/**
 * DevLockService prevents multiple backend instances from connecting to the same database
 * in development environments. This helps avoid data conflicts and race conditions.
 */
@Injectable()
export class DevLockService implements OnModuleInit {
  private readonly logger = new Logger(DevLockService.name);
  private readonly lockTTL = 30000; // 30 seconds
  private lockRefreshInterval?: NodeJS.Timeout;
  private instanceId: string;
  private isLockAcquired = false;

  constructor(
    @InjectConnection() private connection: Connection,
    private configService: ConfigService,
  ) {
    this.instanceId = `${process.pid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async onModuleInit() {
    // Only enable dev lock in development environment
    const nodeEnv = this.configService.get('app.env', 'development');
    const devLockEnabled = process.env.DEV_SINGLE_BACKEND_LOCK !== 'false';
    
    if (nodeEnv === 'development' && devLockEnabled) {
      await this.acquireLock();
    } else {
      this.logger.log('Dev lock disabled (production environment or DEV_SINGLE_BACKEND_LOCK=false)');
    }
  }

  /**
   * Acquire exclusive lock for this backend instance
   */
  private async acquireLock(): Promise<void> {
    try {
      const db = this.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }

      const locksCollection = db.collection('instanceLocks');
      
      // TTL index managed by EphemeralCollectionsService

      const mongoUri = this.configService.get<string>('database.uri');
      const dbName = db.databaseName;
      const lockKey = `backend-${dbName}`;
      
      // Try to acquire lock
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.lockTTL);
      
      const result = await locksCollection.findOneAndUpdate(
        { 
          _id: lockKey as any,
          $or: [
            { expiresAt: { $lt: now } }, // Expired lock
            { instanceId: this.instanceId } // Our own lock
          ]
        },
        {
          $set: {
            instanceId: this.instanceId,
            acquiredAt: now,
            expiresAt: expiresAt,
            mongoUri: this.redactCredentials(mongoUri || ''),
            pid: process.pid,
            nodeVersion: process.version,
            platform: process.platform
          }
        },
        { upsert: true, returnDocument: 'after' }
      );

      if (result && result.instanceId === this.instanceId) {
        this.isLockAcquired = true;
        this.logger.log(`🔒 Dev lock acquired for database: ${dbName} (instance: ${this.instanceId})`);
        
        // Start periodic lock refresh
        this.startLockRefresh(locksCollection, lockKey);
        
        // Setup cleanup on process exit
        this.setupCleanupHandlers(locksCollection, lockKey);
      } else {
        // Lock is held by another instance
        const existingLock = await locksCollection.findOne({ _id: lockKey as any });
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
    } catch (error) {
      this.logger.error('Failed to acquire dev lock:', error);
      process.exit(1);
    }
  }

  /**
   * Start periodic lock refresh to maintain ownership
   */
  private startLockRefresh(locksCollection: any, lockKey: string): void {
    this.lockRefreshInterval = setInterval(async () => {
      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.lockTTL);
        
        await locksCollection.updateOne(
          { _id: lockKey as any, instanceId: this.instanceId },
          { $set: { expiresAt: expiresAt, lastRefreshed: now } }
        );
        
        this.logger.debug(`🔄 Dev lock refreshed for instance: ${this.instanceId}`);
      } catch (error) {
        this.logger.warn('Failed to refresh dev lock:', error);
      }
    }, this.lockTTL / 2); // Refresh at half the TTL interval
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  private setupCleanupHandlers(locksCollection: any, lockKey: string): void {
    const cleanup = async () => {
      if (this.isLockAcquired) {
        try {
          await locksCollection.deleteOne({ _id: lockKey as any, instanceId: this.instanceId });
          this.logger.log(`🔓 Dev lock released for instance: ${this.instanceId}`);
        } catch (error) {
          this.logger.warn('Failed to release dev lock during cleanup:', error);
        }
      }
      
      if (this.lockRefreshInterval) {
        clearInterval(this.lockRefreshInterval);
      }
    };

    // Handle various exit scenarios
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
    process.on('uncaughtException', async (error) => {
      this.logger.error('Uncaught exception, cleaning up dev lock:', error);
      await cleanup();
      process.exit(1);
    });
  }

  /**
   * Redact credentials from MongoDB URI for logging
   */
  private redactCredentials(uri: string): string {
    try {
      return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    } catch {
      return 'mongodb://***:***@***';
    }
  }

  /**
   * Check if dev lock is currently held by this instance
   */
  isLockHeld(): boolean {
    return this.isLockAcquired;
  }

  /**
   * Get current instance ID
   */
  getInstanceId(): string {
    return this.instanceId;
  }
}