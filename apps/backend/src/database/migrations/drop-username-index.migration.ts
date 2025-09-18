import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DropUsernameIndexMigration {
  private readonly logger = new Logger(DropUsernameIndexMigration.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async run(): Promise<void> {
    try {
      const db = this.connection.db;
      if (!db) {
        this.logger.error('Database connection not available');
        return;
      }
      
      const collection = db.collection('users');

      // Check if username_1 index exists
      const indexes = await collection.listIndexes().toArray();
      const usernameIndex = indexes.find(index => index.name === 'username_1');

      if (usernameIndex) {
        this.logger.log('Found legacy username_1 index, attempting to drop...');
        
        try {
          await collection.dropIndex('username_1');
          this.logger.log('✅ Successfully dropped username_1 index');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Failed to drop username_1 index: ${errorMessage}`);
          
          // If we can't drop the index, try to remove documents with null username
          try {
            const result = await collection.deleteMany({ username: null });
            this.logger.log(`Removed ${result.deletedCount} documents with null username`);
          } catch (cleanupError) {
            const cleanupMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
            this.logger.warn(`Failed to cleanup null username documents: ${cleanupMessage}`);
          }
        }
      } else {
        this.logger.log('No username_1 index found, migration not needed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Migration failed: ${errorMessage}`);
      // Don't throw error to prevent app startup failure
    }
  }
}