import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAwardDto, UpdateAwardDto, QueryAwardsDto } from './dto/index';
import { Award as AwardEntity, AwardTier, AwardStatus, AWARD_POINT_VALUES } from './entities/award.entity';
import { Award, AwardDocument } from '../../database/schemas/award.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { AuthenticatedUser } from '../auth/current-user.decorator';

@Injectable()
export class AwardsService {
  constructor(
    @InjectModel(Award.name) private awardModel: Model<AwardDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Check if user has permission to grant specific award tier
   */
  private canGrantAwardTier(userRoles: string[], tier: AwardTier): boolean {
    const hasAdminRole = userRoles.some(role => ['admin', 'head_of_class'].includes(role));
    const hasTeacherRole = userRoles.some(role => role === 'teacher');

    switch (tier) {
      case AwardTier.GOLD:
      case AwardTier.SILVER:
        return hasAdminRole;
      case AwardTier.BRONZE:
        return hasAdminRole || hasTeacherRole;
      default:
        return false;
    }
  }

  /**
   * Convert database document to entity
   */
  private async convertToEntity(doc: AwardDocument): Promise<AwardEntity> {
    const recipient = doc.recipientId ? await this.userModel.findById(doc.recipientId).exec() : null;
    const awardedByUser = await this.userModel.findById(doc.awardedBy).exec();

    return {
      id: (doc._id as Types.ObjectId).toString(),
      name: doc.name,
      description: doc.description,
      tier: doc.tier,
      status: doc.status,
      recipientId: doc.recipientId ? doc.recipientId.toString() : '',
      recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}` : (doc.isTemplate ? 'Template' : 'Unknown'),
      awardedBy: doc.awardedBy.toString(),
      awardedByName: awardedByUser ? `${awardedByUser.firstName} ${awardedByUser.lastName}` : 'Unknown',
      awardedOn: doc.awardedOn,
      reason: doc.reason,
      icon: doc.icon,
      academicYear: doc.academicYear,
      metadata: doc.metadata,
      isTemplate: doc.isTemplate,
      templateName: doc.templateName,
      pointValue: doc.pointValue || AWARD_POINT_VALUES[doc.tier],
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }

  /**
   * Create a new award
   */
  async create(createAwardDto: CreateAwardDto, currentUser: AuthenticatedUser): Promise<AwardEntity> {
    // Check permissions
    if (!this.canGrantAwardTier(currentUser.roles, createAwardDto.tier)) {
      throw new ForbiddenException(`You don't have permission to grant ${createAwardDto.tier} awards`);
    }

    // Verify recipient exists (skip for templates)
    if (!createAwardDto.isTemplate) {
      if (!createAwardDto.recipientId) {
        throw new BadRequestException('Recipient ID is required for non-template awards');
      }
      const recipient = await this.userModel.findById(createAwardDto.recipientId).exec();
      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }
    }

    // Create award with point value
    const awardData = {
      ...createAwardDto,
      awardedBy: new Types.ObjectId(currentUser.id),
      status: AwardStatus.ACTIVE,
      pointValue: AWARD_POINT_VALUES[createAwardDto.tier],
      academicYear: createAwardDto.academicYear || this.getCurrentAcademicYear(),
      ...(createAwardDto.recipientId && { recipientId: new Types.ObjectId(createAwardDto.recipientId) }),
    };

    const createdAward = new this.awardModel(awardData);
    const savedAward = await createdAward.save();

    return this.convertToEntity(savedAward);
  }

  /**
   * Find all awards with filtering and pagination
   */
  async findAll(query: QueryAwardsDto) {
    const {
      page = 1,
      limit = 10,
      recipientId,
      awardedBy,
      tier,
      status,
      academicYear,
      search,
      isTemplate,
      sortBy = 'awardedOn',
      sortOrder = 'desc'
    } = query;

    const filter: any = {};

    if (recipientId) filter.recipientId = new Types.ObjectId(recipientId);
    if (awardedBy) filter.awardedBy = new Types.ObjectId(awardedBy);
    if (tier) filter.tier = tier;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    if (typeof isTemplate === 'boolean') filter.isTemplate = isTemplate;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [awards, total] = await Promise.all([
      this.awardModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.awardModel.countDocuments(filter).exec()
    ]);

    const awardEntities = await Promise.all(
      awards.map(award => this.convertToEntity(award))
    );

    return {
      awards: awardEntities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Find one award by ID
   */
  async findOne(id: string): Promise<AwardEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid award ID');
    }

    const award = await this.awardModel.findById(id).exec();
    if (!award) {
      throw new NotFoundException('Award not found');
    }

    return this.convertToEntity(award);
  }

  /**
   * Update an award
   */
  async update(id: string, updateAwardDto: UpdateAwardDto, currentUser: AuthenticatedUser): Promise<AwardEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid award ID');
    }

    const existingAward = await this.awardModel.findById(id).exec();
    if (!existingAward) {
      throw new NotFoundException('Award not found');
    }

    // Check permissions for tier changes
    if (updateAwardDto.tier && updateAwardDto.tier !== existingAward.tier) {
      if (!this.canGrantAwardTier(currentUser.roles, updateAwardDto.tier)) {
        throw new ForbiddenException(`You don't have permission to change award to ${updateAwardDto.tier} tier`);
      }
    }

    // Update point value if tier changes
    const updateData: any = { ...updateAwardDto };
    if (updateAwardDto.tier) {
      updateData.pointValue = AWARD_POINT_VALUES[updateAwardDto.tier];
    }

    const updatedAward = await this.awardModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return this.convertToEntity(updatedAward!);
  }

  /**
   * Remove an award (soft delete by setting status to revoked)
   */
  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid award ID');
    }

    const award = await this.awardModel.findById(id).exec();
    if (!award) {
      throw new NotFoundException('Award not found');
    }

    // Check permissions
    if (!this.canGrantAwardTier(currentUser.roles, award.tier)) {
      throw new ForbiddenException(`You don't have permission to revoke ${award.tier} awards`);
    }

    await this.awardModel
      .findByIdAndUpdate(id, { status: AwardStatus.REVOKED })
      .exec();
  }

  /**
   * Get award statistics
   */
  async getStats() {
    const [totalAwards, awardsByTier, awardsByStatus, recentAwards] = await Promise.all([
      this.awardModel.countDocuments({ status: AwardStatus.ACTIVE }).exec(),
      this.awardModel.aggregate([
        { $match: { status: AwardStatus.ACTIVE } },
        { $group: { _id: '$tier', count: { $sum: 1 } } }
      ]).exec(),
      this.awardModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).exec(),
      this.awardModel
        .find({ status: AwardStatus.ACTIVE })
        .sort({ awardedOn: -1 })
        .limit(10)
        .exec()
    ]);

    const recentAwardEntities = await Promise.all(
      recentAwards.map(award => this.convertToEntity(award))
    );

    return {
      totalAwards,
      awardsByTier: awardsByTier.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      awardsByStatus: awardsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentAwards: recentAwardEntities
    };
  }

  /**
   * Get student's awards summary
   */
  async getStudentSummary(studentId: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    const [awards, totalPoints] = await Promise.all([
      this.awardModel
        .find({ recipientId: new Types.ObjectId(studentId), status: AwardStatus.ACTIVE })
        .sort({ awardedOn: -1 })
        .exec(),
      this.awardModel.aggregate([
        { $match: { recipientId: new Types.ObjectId(studentId), status: AwardStatus.ACTIVE } },
        { $group: { _id: null, totalPoints: { $sum: '$pointValue' } } }
      ]).exec()
    ]);

    const awardEntities = await Promise.all(
      awards.map(award => this.convertToEntity(award))
    );

    const awardsByTier = awards.reduce((acc, award) => {
      acc[award.tier] = (acc[award.tier] || 0) + 1;
      return acc;
    }, {} as Record<AwardTier, number>);

    return {
      awards: awardEntities,
      totalAwards: awards.length,
      totalPoints: totalPoints[0]?.totalPoints || 0,
      awardsByTier
    };
  }

  /**
   * Get award templates
   */
  async getTemplates(): Promise<AwardEntity[]> {
    const templates = await this.awardModel
      .find({ isTemplate: true })
      .sort({ templateName: 1 })
      .exec();

    return Promise.all(templates.map(template => this.convertToEntity(template)));
  }

  /**
   * Create award from template
   */
  async createFromTemplate(templateId: string, recipientId: string, currentUser: AuthenticatedUser): Promise<AwardEntity> {
    const template = await this.awardModel.findById(templateId).exec();
    if (!template || !template.isTemplate) {
      throw new NotFoundException('Template not found');
    }

    const createDto: CreateAwardDto = {
      name: template.name,
      description: template.description,
      tier: template.tier,
      recipientId,
      reason: template.reason,
      icon: template.icon,
      academicYear: this.getCurrentAcademicYear(),
      metadata: template.metadata
    };

    return this.create(createDto, currentUser);
  }

  /**
   * Get current academic year
   */
  private getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Academic year starts in August (month 7)
    if (month >= 7) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Get leaderboard based on award points
   */
  async getLeaderboard(limit: number = 30) {
    const leaderboard = await this.awardModel.aggregate([
      { $match: { status: AwardStatus.ACTIVE } },
      {
        $group: {
          _id: '$recipientId',
          totalPoints: { $sum: '$pointValue' },
          totalAwards: { $sum: 1 },
          goldAwards: {
            $sum: { $cond: [{ $eq: ['$tier', AwardTier.GOLD] }, 1, 0] }
          },
          silverAwards: {
            $sum: { $cond: [{ $eq: ['$tier', AwardTier.SILVER] }, 1, 0] }
          },
          bronzeAwards: {
            $sum: { $cond: [{ $eq: ['$tier', AwardTier.BRONZE] }, 1, 0] }
          }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ]).exec();

    // Populate user information
    const leaderboardWithUsers = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await this.userModel.findById(entry._id).exec();
        return {
          ...entry,
          userId: entry._id.toString(),
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userAvatar: user?.avatar || null
        };
      })
    );

    return leaderboardWithUsers;
  }

  /**
   * Get award points for specific users
   */
  async getAwardPointsForUsers(userIds: string[]): Promise<{ [userId: string]: number }> {
    const awardPoints = await this.awardModel.aggregate([
      { 
        $match: { 
          status: AwardStatus.ACTIVE,
          recipientId: { $in: userIds.map(id => new Types.ObjectId(id)) }
        } 
      },
      {
        $group: {
          _id: '$recipientId',
          totalPoints: { $sum: '$pointValue' }
        }
      }
    ]).exec();

    // Convert to object with userId as key
    const result: { [userId: string]: number } = {};
    userIds.forEach(userId => {
      result[userId] = 0; // Default to 0 points
    });
    
    awardPoints.forEach(entry => {
      result[entry._id.toString()] = entry.totalPoints;
    });

    return result;
  }
}