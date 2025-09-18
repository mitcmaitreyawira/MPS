import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuestDto, UpdateQuestDto, QueryQuestsDto } from './dto';
import { Quest } from './entities/quest.entity';
import { Quest as QuestDocument, QuestDocument as QuestDoc } from '../../database/schemas/quest.schema';
import { QuestParticipant, QuestParticipantDocument } from '../../database/schemas/quest-participant.schema';

/**
 * QuestsService handles all business logic for Quest operations.
 * Uses MongoDB for persistent storage.
 */
@Injectable()
export class QuestsService {
  constructor(
    @InjectModel(Quest.name) private questModel: Model<QuestDoc>,
    @InjectModel(QuestParticipant.name) private questParticipantModel: Model<QuestParticipantDocument>,
  ) {}

  /**
   * Retrieve all quests with filtering, pagination, and sorting.
   */
  async findAll(query: QueryQuestsDto): Promise<{ quests: Quest[]; total: number; page: number; limit: number }> {
    const filter: any = {};

    // Apply search filter
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Apply status filter
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    // Apply supervisor filter
    if (query.supervisorId) {
      filter.supervisorId = new Types.ObjectId(query.supervisorId);
    }

    // Apply badge tier filter
    if (query.badgeTier) {
      filter.badgeTier = query.badgeTier;
    }

    // Apply academic year filter
    if (query.academicYear) {
      filter.academicYear = query.academicYear;
    }

    // Apply points range filter
    if (query.minPoints !== undefined || query.maxPoints !== undefined) {
      filter.points = {};
      if (query.minPoints !== undefined) {
        filter.points.$gte = query.minPoints;
      }
      if (query.maxPoints !== undefined) {
        filter.points.$lte = query.maxPoints;
      }
    }

    // Apply expiration filter
    if (query.includeExpired === false) {
      const now = new Date();
      filter.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ];
    }

    // Sort configuration
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Execute queries
    const [quests, total] = await Promise.all([
      this.questModel
        .find(filter)
        .populate('supervisorId', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.questModel.countDocuments(filter).exec(),
    ]);

    // Update participant counts
    const questsWithCounts = await Promise.all(
      quests.map(async (quest) => {
        const participantCount = await this.questParticipantModel
          .countDocuments({ questId: quest._id })
          .exec();
        const completionCount = await this.questParticipantModel
          .countDocuments({ questId: quest._id, status: 'completed' })
          .exec();
        
        return {
          ...this.transformToEntity(quest),
          participantCount,
          completionCount,
        };
      })
    );

    return {
      quests: questsWithCounts,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a quest by ID.
   */
  async findOne(id: string): Promise<Quest> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quest ID format');
    }

    const quest = await this.questModel
      .findById(id)
      .populate('supervisorId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    if (!quest) {
      throw new NotFoundException(`Quest with ID ${id} not found`);
    }

    // Get participant counts
    const [participantCount, completionCount] = await Promise.all([
      this.questParticipantModel.countDocuments({ questId: quest._id }).exec(),
      this.questParticipantModel.countDocuments({ questId: quest._id, status: 'completed' }).exec(),
    ]);

    return {
      ...this.transformToEntity(quest),
      participantCount,
      completionCount,
    };
  }

  /**
   * Create a new quest.
   */
  async create(createQuestDto: CreateQuestDto): Promise<Quest> {
    const questData = {
      ...createQuestDto,
      supervisorId: createQuestDto.supervisorId ? new Types.ObjectId(createQuestDto.supervisorId) : undefined,
      createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'), // In real app, get from auth context
      createdAt: new Date(),
      isActive: true,
      expiresAt: createQuestDto.expiresAt ? new Date(createQuestDto.expiresAt) : undefined,
    };

    const createdQuest = await this.questModel.create(questData);
    const populatedQuest = await this.questModel
      .findById(createdQuest._id)
      .populate('supervisorId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    return {
      ...this.transformToEntity(populatedQuest!),
      participantCount: 0,
      completionCount: 0,
    };
  }

  /**
   * Update an existing quest.
   */
  async update(id: string, updateQuestDto: UpdateQuestDto): Promise<Quest> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quest ID format');
    }

    const updateData: any = { ...updateQuestDto };
    
    // Convert supervisorId to ObjectId if provided
    if (updateQuestDto.supervisorId) {
      updateData.supervisorId = new Types.ObjectId(updateQuestDto.supervisorId);
    }
    
    // Convert expiresAt to Date if provided
    if (updateQuestDto.expiresAt !== undefined) {
      updateData.expiresAt = updateQuestDto.expiresAt ? new Date(updateQuestDto.expiresAt) : null;
    }

    const updatedQuest = await this.questModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('supervisorId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    if (!updatedQuest) {
      throw new NotFoundException(`Quest with ID ${id} not found`);
    }

    // Get participant counts
    const [participantCount, completionCount] = await Promise.all([
      this.questParticipantModel.countDocuments({ questId: updatedQuest._id }).exec(),
      this.questParticipantModel.countDocuments({ questId: updatedQuest._id, status: 'completed' }).exec(),
    ]);

    return {
      ...this.transformToEntity(updatedQuest),
      participantCount,
      completionCount,
    };
  }

  /**
   * Delete a quest by ID.
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quest ID format');
    }

    const deletedQuest = await this.questModel.findByIdAndDelete(id).exec();
    
    if (!deletedQuest) {
      throw new NotFoundException(`Quest with ID ${id} not found`);
    }

    // Clean up related quest participants
    await this.questParticipantModel.deleteMany({ questId: deletedQuest._id }).exec();
  }

  /**
   * Get quest statistics for dashboard.
   */
  async getStats(): Promise<{ total: number; active: number; expired: number }> {
    const now = new Date();
    
    const [total, active, expired] = await Promise.all([
      this.questModel.countDocuments().exec(),
      this.questModel.countDocuments({
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ]
      }).exec(),
      this.questModel.countDocuments({
        expiresAt: { $lte: now }
      }).exec(),
    ]);
    
    return { total, active, expired };
  }

  /**
   * Transform MongoDB document to Quest entity.
   */
  private transformToEntity(doc: any): Quest {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      points: doc.points,
      supervisorId: doc.supervisorId?._id?.toString() || doc.supervisorId?.toString(),
      requiredPoints: doc.requiredPoints,
      isActive: doc.isActive,
      badgeTier: doc.badgeTier,
      badgeReason: doc.badgeReason,
      badgeIcon: doc.badgeIcon,
      slotsAvailable: doc.slotsAvailable,
      academicYear: doc.academicYear,
      createdBy: doc.createdBy?._id?.toString() || doc.createdBy?.toString(),
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    };
  }
}