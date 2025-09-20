import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import { Redis } from 'ioredis';

@Injectable()
export class DevLockService implements OnModuleDestroy {
  private readonly logger = new Logger(DevLockService.name);
  private readonly lockFilePath: string;
  private readonly redisClient: Redis | null = null;
  private readonly lockKey = 'devlock:backend:instance';
  private readonly lockTTL = 30; // 30 seconds TTL
  private lockRefreshInterval: NodeJS.Timeout | null = null;
  private isLocked = false;

  constructor(private readonly configService: ConfigService) {
    this.lockFilePath = path.join(process.cwd(), '.devlock.pid');
    
    // Initialize Redis client if available
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
      
      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    } catch (error) {
      this.logger.warn('Redis not available for DevLock mutex, continuing with port and PID checks only');
    }
  }

  /**
   * Acquire all three locks: port preflight, PID lockfile, and Redis mutex
   */
  async acquireLock(): Promise<void> {
    const devlockEnabled = this.configService.get<string>('DEVLOCK', 'true') === 'true';
    
    if (!devlockEnabled) {
      this.logger.log('DevLock is disabled via DEVLOCK=false');
      return;
    }

    this.logger.log('🔒 Acquiring DevLock...');

    // Layer 1: Port preflight check
    await this.checkPortAvailability();
    
    // Layer 2: PID lockfile
    await this.acquirePidLock();
    
    // Layer 3: Redis mutex (if available)
    if (this.redisClient) {
      await this.acquireRedisMutex();
    }

    this.isLocked = true;
    this.logger.log('✅ DevLock acquired successfully');
  }

  /**
   * Layer 1: Check if the configured port is available
   */
  private async checkPortAvailability(): Promise<void> {
    const port = this.configService.get<number>('PORT', 3002);
    
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => {
          this.logger.log(`✅ Port ${port} is available`);
          resolve();
        });
      });
      
      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          this.logger.error(`❌ Port ${port} is already in use. Another backend instance may be running.`);
          this.logger.error('💡 Troubleshooting:');
          this.logger.error(`   - Check what's using port ${port}: lsof -i :${port}`);
          this.logger.error(`   - Kill the process: kill -9 <PID>`);
          this.logger.error('   - Or disable DevLock temporarily: DEVLOCK=false');
          reject(new Error(`Port ${port} is already in use`));
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Layer 2: Create and manage PID lockfile
   */
  private async acquirePidLock(): Promise<void> {
    try {
      // Check if lockfile exists and process is still running
      if (fs.existsSync(this.lockFilePath)) {
        const existingPid = fs.readFileSync(this.lockFilePath, 'utf8').trim();
        
        if (this.isProcessRunning(parseInt(existingPid))) {
          this.logger.error(`❌ Another backend instance is running (PID: ${existingPid})`);
          this.logger.error('💡 Troubleshooting:');
          this.logger.error(`   - Kill the process: kill -9 ${existingPid}`);
          this.logger.error(`   - Remove stale lockfile: rm ${this.lockFilePath}`);
          this.logger.error('   - Or disable DevLock temporarily: DEVLOCK=false');
          throw new Error(`Backend instance already running with PID ${existingPid}`);
        } else {
          this.logger.warn(`🧹 Removing stale lockfile (PID ${existingPid} not running)`);
          fs.unlinkSync(this.lockFilePath);
        }
      }
      
      // Create new lockfile with current PID
      fs.writeFileSync(this.lockFilePath, process.pid.toString());
      this.logger.log(`✅ PID lockfile created (PID: ${process.pid})`);
      
      // Clean up lockfile on process exit
      process.on('exit', () => this.releasePidLock());
      process.on('SIGINT', () => {
        this.releasePidLock();
        process.exit(0);
      });
      process.on('SIGTERM', () => {
        this.releasePidLock();
        process.exit(0);
      });
      
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already running')) {
        this.logger.error(`Failed to acquire PID lock: ${error.message}`);
        throw error;
      }
      throw error;
    }
  }

  /**
   * Layer 3: Redis mutex with TTL
   */
  private async acquireRedisMutex(): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      await this.redisClient.connect();
      
      // Try to set the lock with NX (only if not exists) and EX (expiration)
      const result = await this.redisClient.set(
        this.lockKey,
        `${process.pid}:${Date.now()}`,
        'EX',
        this.lockTTL,
        'NX'
      );
      
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
      
      // Refresh the lock periodically to maintain it
      this.lockRefreshInterval = setInterval(async () => {
        try {
          await this.redisClient?.expire(this.lockKey, this.lockTTL);
        } catch (error) {
          this.logger.warn('Failed to refresh Redis lock:', error);
        }
      }, (this.lockTTL * 1000) / 2); // Refresh at half TTL
      
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already held')) {
        this.logger.warn(`Redis mutex unavailable: ${error.message}`);
        // Don't fail if Redis is unavailable, just log warning
        return;
      }
      throw error;
    }
  }

  /**
   * Check if a process with given PID is running
   */
  private isProcessRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Release PID lockfile
   */
  private releasePidLock(): void {
    try {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath);
        this.logger.log('🧹 PID lockfile released');
      }
    } catch (error) {
      this.logger.warn('Failed to release PID lockfile:', error);
    }
  }

  /**
   * Release Redis mutex
   */
  private async releaseRedisMutex(): Promise<void> {
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
    } catch (error) {
      this.logger.warn('Failed to release Redis mutex:', error);
    }
  }

  /**
   * Release all locks on module destroy
   */
  async onModuleDestroy(): Promise<void> {
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

  /**
   * Get current lock status for health checks
   */
  getLockStatus(): {
    enabled: boolean;
    locked: boolean;
    pid: number;
    lockFile: string;
    redisAvailable: boolean;
  } {
    return {
      enabled: this.configService.get<string>('DEVLOCK', 'true') === 'true',
      locked: this.isLocked,
      pid: process.pid,
      lockFile: this.lockFilePath,
      redisAvailable: this.redisClient !== null,
    };
  }
}