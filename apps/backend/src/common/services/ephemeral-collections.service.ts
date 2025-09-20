import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EPHEMERAL_COLLECTIONS, EphemeralCollectionConfig } from '../../config/ephemeral-collections';

/**
 * Service to manage TTL indexes for ephemeral collections.
 * This centralizes TTL management and ensures consistent behavior across collections.
 */
@Injectable()
export class EphemeralCollectionsService implements OnModuleInit {
  private readonly logger = new Logger(EphemeralCollectionsService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Initialize TTL indexes for all ephemeral collections on module startup
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.createTTLIndexes();
      this.logger.log(`✅ TTL indexes initialized for ${EPHEMERAL_COLLECTIONS.length} ephemeral collections`);
    } catch (error) {
      this.logger.error('Failed to initialize TTL indexes:', error);
      // Don't throw - allow app to start even if TTL setup fails
    }
  }

  /**
   * Create TTL indexes for all configured ephemeral collections
   */
  async createTTLIndexes(): Promise<void> {
    const db = this.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    for (const config of EPHEMERAL_COLLECTIONS) {
      try {
        await this.createTTLIndex(config);
        this.logger.debug(`TTL index created for collection: ${config.name}`);
      } catch (error) {
        this.logger.warn(`Failed to create TTL index for ${config.name}:`, error);
      }
    }
  }

  /**
   * Create TTL index for a specific collection
   */
  private async createTTLIndex(config: EphemeralCollectionConfig): Promise<void> {
    const db = this.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collection = db.collection(config.name);
    const indexField = config.indexField || 'createdAt';
    
    const indexSpec = { [indexField]: 1 };
    const indexOptions = {
      expireAfterSeconds: config.ttlSeconds,
      background: true,
      name: `${indexField}_ttl`
    };

    try {
      await collection.createIndex(indexSpec, indexOptions);
      this.logger.debug(
        `TTL index created: ${config.name}.${indexField} (${config.ttlSeconds}s) - ${config.description}`
      );
    } catch (error: any) {
      // Index might already exist with different options
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        this.logger.debug(`TTL index already exists for ${config.name}, skipping`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get TTL information for all ephemeral collections
   */
  async getTTLInfo(): Promise<Array<{ collection: string; ttl: number; description: string }>> {
    return EPHEMERAL_COLLECTIONS.map(config => ({
      collection: config.name,
      ttl: config.ttlSeconds,
      description: config.description
    }));
  }

  /**
   * Manually clean up expired documents (for testing or maintenance)
   */
  async cleanupExpiredDocuments(collectionName?: string): Promise<{ [collection: string]: number }> {
    const db = this.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const results: { [collection: string]: number } = {};
    const collectionsToClean = collectionName 
      ? EPHEMERAL_COLLECTIONS.filter(c => c.name === collectionName)
      : EPHEMERAL_COLLECTIONS;

    for (const config of collectionsToClean) {
      try {
        const collection = db.collection(config.name);
        const indexField = config.indexField || 'createdAt';
        const cutoffTime = new Date(Date.now() - (config.ttlSeconds * 1000));
        
        const deleteResult = await collection.deleteMany({
          [indexField]: { $lt: cutoffTime }
        });
        
        results[config.name] = deleteResult.deletedCount || 0;
        
        if (deleteResult.deletedCount && deleteResult.deletedCount > 0) {
          this.logger.log(`Cleaned up ${deleteResult.deletedCount} expired documents from ${config.name}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to cleanup ${config.name}:`, error);
        results[config.name] = -1; // Indicate error
      }
    }

    return results;
  }
}