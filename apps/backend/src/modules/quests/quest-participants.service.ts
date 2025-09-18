import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuestParticipant, QuestCompletionStatus } from './entities/quest-participant.entity';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';

export interface CreateQuestParticipantDto {
  questId: string;
  studentId: string;
  academicYear?: string;
}

export interface UpdateQuestParticipantDto {
  status?: QuestCompletionStatus;
  reviewNotes?: string;
}

export interface QueryQuestParticipantsDto {
  page?: number;
  limit?: number;
  questId?: string;
  studentId?: string;
  status?: QuestCompletionStatus;
  academicYear?: string;
}

@Injectable()
export class QuestParticipantsService {
  constructor(
    @InjectModel('QuestParticipant') private readonly questParticipantModel: Model<any>,
    private readonly logger: StructuredLoggerService,
    private readonly performanceService: PerformanceService,
  ) {}

  async create(createDto: CreateQuestParticipantDto): Promise<QuestParticipant> {
    const timerId = `quest-participant-create-${Date.now()}`;
    this.performanceService.startTimer(timerId, { questId: createDto.questId, studentId: createDto.studentId });

    try {
      // Validate input parameters
      if (!createDto.questId || !createDto.studentId) {
        throw new BadRequestException('Quest ID and Student ID are required');
      }

      // Validate ObjectIds with better error messages
      if (!Types.ObjectId.isValid(createDto.questId)) {
        this.logger.warn('Invalid quest ID format provided', {
          metadata: { questId: createDto.questId, type: typeof createDto.questId }
        });
        throw new BadRequestException('The quest you are trying to join is invalid. Please refresh the page and try again.');
      }
      
      if (!Types.ObjectId.isValid(createDto.studentId)) {
        this.logger.warn('Invalid student ID format provided', {
          metadata: { studentId: createDto.studentId, type: typeof createDto.studentId }
        });
        throw new BadRequestException('Your account information is invalid. Please log out and log back in.');
      }

      // Verify student exists in database
      const studentExists = await this.questParticipantModel.db.collection('users').findOne(
        { _id: new Types.ObjectId(createDto.studentId) },
        { projection: { _id: 1, roles: 1 } }
      );
      
      if (!studentExists) {
        this.logger.warn('Student not found in database', {
          metadata: { studentId: createDto.studentId }
        });
        throw new BadRequestException('Your account was not found. Please contact your administrator.');
      }

      // Verify user has student role
      if (!studentExists.roles || !studentExists.roles.includes('student')) {
        this.logger.warn('User attempting to join quest without student role', {
          metadata: { studentId: createDto.studentId, roles: studentExists.roles }
        });
        throw new BadRequestException('Only students can join quests. Please contact your administrator if you believe this is an error.');
      }

      // Get quest details for eligibility validation
      const quest = await this.questParticipantModel.db.collection('quests').findOne(
        { _id: new Types.ObjectId(createDto.questId) },
        { projection: { isActive: 1, expiresAt: 1, slotsAvailable: 1, requiredPoints: 1, title: 1 } }
      );
      
      if (!quest) {
        throw new NotFoundException('Quest not found');
      }

      // Check if quest is active
      if (quest.isActive === false) {
        throw new BadRequestException('This quest is not currently active');
      }

      // Check if quest has expired
      if (quest.expiresAt && new Date(quest.expiresAt) < new Date()) {
        throw new BadRequestException('This quest has expired');
      }

      // Check available slots
      if (quest.slotsAvailable && quest.slotsAvailable > 0) {
        const currentParticipants = await this.questParticipantModel.countDocuments({
          questId: new Types.ObjectId(createDto.questId),
        });
        
        if (currentParticipants >= quest.slotsAvailable) {
          throw new BadRequestException('No slots available for this quest');
        }
      }

      // Check student's point eligibility
      if (quest.requiredPoints !== undefined && quest.requiredPoints !== null) {
        // Get student's total points
        const studentPoints = await this.questParticipantModel.db.collection('pointlogs').aggregate([
          { $match: { studentId: new Types.ObjectId(createDto.studentId) } },
          { $group: { _id: null, totalPoints: { $sum: '$points' } } }
        ]).toArray();
        
        const totalPoints = studentPoints.length > 0 ? (studentPoints[0]?.totalPoints || 0) : 0;
      
      if (totalPoints > quest.requiredPoints) {
        throw new BadRequestException(
          `You have too many points to join this quest. Maximum allowed: ${quest.requiredPoints}, you have: ${totalPoints}`
        );
      }
      }

      // Check if participant already exists
      const existing = await this.questParticipantModel
        .findOne({
          questId: new Types.ObjectId(createDto.questId),
          studentId: new Types.ObjectId(createDto.studentId)
        })
        .exec();
      
      if (existing) {
        this.logger.log('Student attempted to join quest they are already participating in', {
          metadata: { questId: createDto.questId, studentId: createDto.studentId }
        });
        throw new BadRequestException('You are already participating in this quest. Check your active quests to continue your progress.');
      }

      const questParticipantData = {
        questId: new Types.ObjectId(createDto.questId),
        studentId: new Types.ObjectId(createDto.studentId),
        joinedAt: new Date(),
        status: QuestCompletionStatus.IN_PROGRESS,
        academicYear: createDto.academicYear,
      };

      const createdParticipant = await this.questParticipantModel.create(questParticipantData);
      const populatedParticipant = await this.questParticipantModel
        .findById(createdParticipant._id)
        .populate('questId', 'title')
        .populate('studentId', 'firstName lastName')
        .lean()
        .exec();

      const result = this.transformToEntity(populatedParticipant!);

      this.logger.log('Quest participant created', {
        metadata: {
          questId: result.questId,
          studentId: result.studentId,
          status: result.status,
        },
      });

      this.performanceService.endTimer(timerId, { participantId: `${result.questId}-${result.studentId}` });
      return result;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to create quest participant', error instanceof Error ? error.stack : String(error), {
        metadata: { questId: createDto.questId, studentId: createDto.studentId },
      });
      throw error;
    }
  }

  async findAll(query: QueryQuestParticipantsDto): Promise<{ participants: QuestParticipant[], total: number, pagination: any }> {
    const timerId = `quest-participants-query-${Date.now()}`;
    this.performanceService.startTimer(timerId, { query });

    try {
      const { page = 1, limit = 10, questId, studentId, status, academicYear } = query;
      
      const filter: any = {};

      // Apply filters
      if (questId) {
        if (!Types.ObjectId.isValid(questId)) {
          throw new BadRequestException('Invalid quest ID format');
        }
        filter.questId = new Types.ObjectId(questId);
      }
      if (studentId) {
        if (!Types.ObjectId.isValid(studentId)) {
          throw new BadRequestException('Invalid student ID format');
        }
        filter.studentId = new Types.ObjectId(studentId);
      }
      if (status) {
        filter.status = status;
      }
      if (academicYear) {
        filter.academicYear = academicYear;
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Execute queries
      const [participants, total] = await Promise.all([
        this.questParticipantModel
          .find(filter)
          .populate('questId', 'title')
          .populate('studentId', 'firstName lastName')
          .sort({ joinedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.questParticipantModel.countDocuments(filter).exec(),
      ]);

      const transformedParticipants = participants.map(p => this.transformToEntity(p));

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      };

      this.performanceService.endTimer(timerId, { total, page, limit });
      return { participants: transformedParticipants, total, pagination };
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to query quest participants', error instanceof Error ? error.stack : String(error), {
        metadata: { query },
      });
      throw error;
    }
  }

  async findOne(questId: string, studentId: string): Promise<QuestParticipant> {
    const timerId = `quest-participant-find-${Date.now()}`;
    this.performanceService.startTimer(timerId, { questId, studentId });

    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(questId)) {
        throw new BadRequestException('Invalid quest ID format');
      }
      if (!Types.ObjectId.isValid(studentId)) {
        throw new BadRequestException('Invalid student ID format');
      }

      const participant = await this.questParticipantModel
        .findOne({
          questId: new Types.ObjectId(questId),
          studentId: new Types.ObjectId(studentId)
        })
        .populate('questId', 'title')
        .populate('studentId', 'firstName lastName')
        .lean()
        .exec();

      if (!participant) {
        throw new NotFoundException(`Quest participant not found for quest ${questId} and student ${studentId}`);
      }

      const result = this.transformToEntity(participant);
      this.performanceService.endTimer(timerId, { found: true });
      return result;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to find quest participant', error instanceof Error ? error.stack : String(error), {
        metadata: { questId, studentId },
      });
      throw error;
    }
  }

  async update(questId: string, studentId: string, updateDto: UpdateQuestParticipantDto): Promise<QuestParticipant> {
    const timerId = `quest-participant-update-${Date.now()}`;
    this.performanceService.startTimer(timerId, { questId, studentId, updateDto });

    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(questId)) {
        throw new BadRequestException('Invalid quest ID format');
      }
      if (!Types.ObjectId.isValid(studentId)) {
        throw new BadRequestException('Invalid student ID format');
      }

      const updateData: any = { ...updateDto };
      
      // Set completion timestamp if status is being changed to completed
      if (updateDto.status === QuestCompletionStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      const updatedParticipant = await this.questParticipantModel
        .findOneAndUpdate(
          {
            questId: new Types.ObjectId(questId),
            studentId: new Types.ObjectId(studentId)
          },
          updateData,
          { new: true }
        )
        .populate('questId', 'title')
        .populate('studentId', 'firstName lastName')
        .lean()
        .exec();

      if (!updatedParticipant) {
        throw new NotFoundException(`Quest participant not found for quest ${questId} and student ${studentId}`);
      }

      const result = this.transformToEntity(updatedParticipant);

      this.logger.log('Quest participant updated', {
        metadata: {
          questId: result.questId,
          studentId: result.studentId,
          status: result.status,
          changes: updateDto,
        },
      });

      this.performanceService.endTimer(timerId, { updated: true });
      return result;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to update quest participant', error instanceof Error ? error.stack : String(error), {
        metadata: { questId, studentId, updateDto },
      });
      throw error;
    }
  }

  async remove(questId: string, studentId: string): Promise<void> {
    const timerId = `quest-participant-remove-${Date.now()}`;
    this.performanceService.startTimer(timerId, { questId, studentId });

    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(questId)) {
        throw new BadRequestException('Invalid quest ID format');
      }
      if (!Types.ObjectId.isValid(studentId)) {
        throw new BadRequestException('Invalid student ID format');
      }

      const deletedParticipant = await this.questParticipantModel
        .findOneAndDelete({
          questId: new Types.ObjectId(questId),
          studentId: new Types.ObjectId(studentId)
        })
        .exec();

      if (!deletedParticipant) {
        throw new NotFoundException(`Quest participant not found for quest ${questId} and student ${studentId}`);
      }

      this.logger.log('Quest participant removed', {
        metadata: { questId, studentId },
      });

      this.performanceService.endTimer(timerId, { removed: true });
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to remove quest participant', error instanceof Error ? error.stack : String(error), {
        metadata: { questId, studentId },
      });
      throw error;
    }
  }

  /**
   * Transform MongoDB document to QuestParticipant entity.
   */
  private transformToEntity(doc: any): QuestParticipant {
    return {
      questId: doc.questId?._id?.toString() || doc.questId?.toString(),
      studentId: doc.studentId?._id?.toString() || doc.studentId?.toString(),
      joinedAt: doc.joinedAt,
      status: doc.status,
      completedAt: doc.completedAt,
      reviewNotes: doc.reviewNotes,
      academicYear: doc.academicYear,
    };
  }
}