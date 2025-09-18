import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../database/schemas/user.schema';
import { Award, AwardDocument } from '../../database/schemas/award.schema';
import { Class, ClassDocument } from '../../database/schemas/class.schema';
import { PointLog, PointLogDocument } from '../../database/schemas/point-log.schema';
import { Quest, QuestDocument } from '../../database/schemas/quest.schema';

/**
 * AdminService handles dangerous administrative operations
 * All methods in this service perform destructive operations
 * and should be used with extreme caution.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Award.name) private readonly awardModel: Model<AwardDocument>,
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(PointLog.name) private readonly pointLogModel: Model<PointLogDocument>,
    @InjectModel(Quest.name) private readonly questModel: Model<QuestDocument>,
  ) {}

  /**
   * Bulk delete multiple users
   * WARNING: This permanently deletes users and cannot be undone
   */
  async bulkDeleteUsers(userIds: string[]): Promise<{ deletedCount: number }> {
    this.logger.warn(`Attempting to bulk delete ${userIds.length} users: ${userIds.join(', ')}`);
    
    // Validate that users exist
    const existingUsers = await this.userModel.find({ _id: { $in: userIds } });
    if (existingUsers.length !== userIds.length) {
      throw new NotFoundException('Some users not found');
    }

    // Delete related data first
    await this.pointLogModel.deleteMany({ studentId: { $in: userIds } });
    await this.awardModel.deleteMany({ recipientId: { $in: userIds } });
    
    // Delete users
    const result = await this.userModel.deleteMany({ _id: { $in: userIds } });
    
    this.logger.error(`DELETED ${result.deletedCount} users permanently`);
    return { deletedCount: result.deletedCount };
  }

  /**
   * Delete a specific badge and revoke it from all users
   * WARNING: This permanently deletes the badge and removes it from all users
   */
  async deleteBadge(badgeId: string): Promise<{ deletedBadge: string; affectedUsers: number }> {
    this.logger.warn(`Deleting badge: ${badgeId}`);
    
    // First, check if the badge exists
    const badge = await this.awardModel.findById(badgeId);
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }
    
    // Count how many users will be affected
    const affectedUsersCount = await this.awardModel.countDocuments({ _id: badgeId });
    
    // Delete the badge (this will remove it from all users who have it)
    await this.awardModel.deleteOne({ _id: badgeId });
    
    this.logger.error(`DELETED badge ${badgeId}, affected ${affectedUsersCount} users`);
    return { deletedBadge: badgeId, affectedUsers: affectedUsersCount };
  }



  /**
   * Emergency system reset - nuclear option
   * WARNING: This resets most system data
   */
  async emergencySystemReset(): Promise<{ message: string; timestamp: string }> {
    const timestamp = new Date().toISOString();
    this.logger.error(`EMERGENCY SYSTEM RESET INITIATED at ${timestamp}`);
    
    // Reset all student points
    await this.userModel.updateMany(
      { role: 'student' },
      { $set: { points: 0 } }
    );
    
    // Clear point logs
    await this.pointLogModel.deleteMany({});
    
    // Reset quest progress
    await this.questModel.updateMany(
      {},
      { $set: { status: 'draft', participants: [] } }
    );
    
    // Clear awards
    await this.awardModel.deleteMany({});
    
    this.logger.error('EMERGENCY RESET COMPLETED - System data has been reset');
    
    return {
      message: 'Emergency system reset completed successfully',
      timestamp
    };
  }
}