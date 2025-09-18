import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePointLogDto, UpdatePointLogDto, QueryPointLogsDto, BulkCreatePointLogsDto } from './dto';
import { PointLog as PointLogEntity, PointType, BadgeTier } from './entities/point-log.entity';
import { PointLog, PointLogDocument } from '../../database/schemas/point-log.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class PointLogsService {
  constructor(
    @InjectModel(PointLog.name) private pointLogModel: Model<PointLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.initializeStudentPoints();
  }

  /**
   * Initialize all students with 100 points if they don't have any point logs
   */
  private async initializeStudentPoints(): Promise<void> {
    try {
      // Find all students
      const students = await this.userModel.find({ roles: 'student' }).exec();
      
      for (const student of students) {
        // Check if student already has point logs
        const existingLogs = await this.pointLogModel.countDocuments({ studentId: student._id });
        
        if (existingLogs === 0) {
          // Create initial 100 point log for new students
          await this.pointLogModel.create({
            studentId: student._id,
            points: 100,
            type: PointType.REWARD,
            category: 'Initial Points',
            description: 'Welcome bonus - starting points',
            addedBy: student._id, // System initialization
            timestamp: new Date(),
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          });
        }
      }
    } catch (error) {
      console.error('Error initializing student points:', error);
    }
  }

  /**
   * Get student's total points
   */
  private async getStudentTotalPoints(studentId: string): Promise<number> {
    const logs = await this.pointLogModel.find({ studentId }).exec();
    return logs.reduce((total, log) => total + log.points, 0);
  }

  /**
   * Convert database document to entity
   */
  private convertToEntity(doc: PointLogDocument): PointLogEntity {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      studentId: doc.studentId,
      points: doc.points,
      type: doc.type,
      category: doc.category,
      description: doc.description,
      timestamp: doc.timestamp,
      addedBy: doc.addedBy,
      badge: doc.badge,
      academicYear: doc.academicYear,
    };
  }

  /**
   * Create a new point log.
   */
  async create(createPointLogDto: CreatePointLogDto): Promise<PointLogEntity> {
    // Validate that the target user exists and has the student role
    const targetUser = await this.userModel.findById(createPointLogDto.studentId).exec();
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${createPointLogDto.studentId} not found`);
    }
    
    // Check if the target user has the student role
    const hasStudentRole = targetUser.roles && targetUser.roles.includes('student');
    if (!hasStudentRole) {
      throw new BadRequestException('Points can only be awarded to users with the student role');
    }
    
    // Enforce correct sign based on type (server-side guard)
    const normalizedPoints = createPointLogDto.type === PointType.VIOLATION
      ? -Math.abs(createPointLogDto.points)
      : Math.abs(createPointLogDto.points);
    
    // Enforce maximum score limit of 100
    const currentTotal = await this.getStudentTotalPoints(createPointLogDto.studentId);
    const newTotal = currentTotal + normalizedPoints;
    
    // If adding points would exceed 100, cap the points to reach exactly 100
    let adjustedPoints = normalizedPoints;
    if (newTotal > 100 && normalizedPoints > 0) {
      adjustedPoints = Math.max(0, 100 - currentTotal);
    }
    
    const pointLog = await this.pointLogModel.create({
      ...createPointLogDto,
      points: adjustedPoints,
      timestamp: new Date(),
    });
    
    return this.convertToEntity(pointLog);
  }

  /**
   * Create multiple point logs at once.
   */
  async bulkCreate(bulkCreatePointLogsDto: BulkCreatePointLogsDto): Promise<PointLogEntity[]> {
    const createdPointLogs: PointLogEntity[] = [];
    
    for (const pointLogDto of bulkCreatePointLogsDto.pointLogs) {
      const created = await this.create(pointLogDto);
      createdPointLogs.push(created);
    }

    return createdPointLogs;
  }

  /**
   * Find all point logs with filtering and pagination.
   */
  async findAll(query: QueryPointLogsDto) {
    const {
      page = 1,
      limit = 10,
      studentId,
      type,
      category,
      addedBy,
      startDate,
      endDate,
      academicYear,
    } = query;

    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (type) filter.type = type;
    if (category) filter.category = new RegExp(category, 'i');
    if (addedBy) filter.addedBy = addedBy;
    if (academicYear) filter.academicYear = academicYear;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.pointLogModel.find(filter).skip(skip).limit(limit).sort({ timestamp: -1 }).exec(),
      this.pointLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map(doc => this.convertToEntity(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single point log by ID.
   */
  async findOne(id: string): Promise<PointLogEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Point log with ID ${id} not found`);
    }

    const pointLog = await this.pointLogModel.findById(id).exec();
    if (!pointLog) {
      throw new NotFoundException(`Point log with ID ${id} not found`);
    }

    return this.convertToEntity(pointLog);
  }

  /**
   * Update a point log.
   */
  async update(id: string, updatePointLogDto: UpdatePointLogDto): Promise<PointLogEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Point log with ID ${id} not found`);
    }

    const pointLog = await this.pointLogModel.findByIdAndUpdate(
      id,
      updatePointLogDto,
      { new: true }
    ).exec();

    if (!pointLog) {
      throw new NotFoundException(`Point log with ID ${id} not found`);
    }

    return this.convertToEntity(pointLog);
  }

  /**
   * Remove a point log.
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Point log with ID ${id} not found`);
    }

    const result = await this.pointLogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Point log with ID ${id} not found`);
    }
  }

  /**
   * Get point log statistics.
   */
  async getStats() {
    const logs = await this.pointLogModel.find().exec();
    
    const totalEntries = logs.length;
    const totalPointsAwarded = logs.filter(log => log.points > 0).reduce((sum, log) => sum + log.points, 0);
    const totalPointsDeducted = Math.abs(logs.filter(log => log.points < 0).reduce((sum, log) => sum + log.points, 0));
    const netPoints = totalPointsAwarded - totalPointsDeducted;
    
    const entriesByType = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const entriesByCategory = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const badgesAwarded = logs.filter(log => log.badge).length;
    const averagePointsPerEntry = totalEntries > 0 ? (totalPointsAwarded + totalPointsDeducted) / totalEntries : 0;

    return {
      totalEntries,
      totalPointsAwarded,
      totalPointsDeducted,
      netPoints,
      entriesByType,
      entriesByCategory,
      badgesAwarded,
      averagePointsPerEntry,
    };
  }

  /**
   * Get student summary with total points capped at 100.
   */
  async getStudentSummary(studentId: string) {
    const logs = await this.pointLogModel.find({ studentId }).sort({ timestamp: -1 }).exec();
    
    const totalPoints = Math.min(100, logs.reduce((sum, log) => sum + log.points, 0));
    const recentLogs = logs.slice(0, 10).map(doc => this.convertToEntity(doc));
    
    const pointsByCategory = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.points;
      return acc;
    }, {} as Record<string, number>);
    
    const badges = logs.filter(log => log.badge).map(log => log.badge);
    
    return {
      studentId,
      totalPoints,
      percentage: totalPoints, // Since max is 100, percentage is the same as total points
      recentLogs,
      pointsByCategory,
      badges,
      logCount: logs.length,
    };
  }
}