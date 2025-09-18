import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAppealDto, UpdateAppealDto, QueryAppealsDto } from './dto';
import { Appeal, AppealStatus } from './entities/appeal.entity';
import { Appeal as AppealSchema, AppealDocument } from '../../database/schemas/appeal.schema';

@Injectable()
export class AppealsService {
  constructor(
    @InjectModel(AppealSchema.name) private appealModel: Model<AppealDocument>,
  ) {}

  /**
   * Create a new appeal.
   */
  async create(createAppealDto: CreateAppealDto): Promise<Appeal> {
    const newAppeal = new this.appealModel({
      id: `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pointLogId: createAppealDto.pointLogId,
      studentId: createAppealDto.studentId,
      reason: createAppealDto.reason,
      status: AppealStatus.PENDING,
      submittedAt: new Date(),
      academicYear: createAppealDto.academicYear,
    });

    const savedAppeal = await newAppeal.save();
    return this.toAppealEntity(savedAppeal);
  }

  /**
   * Find all appeals with filtering and pagination.
   */
  async findAll(query: QueryAppealsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      studentId,
      reviewedBy,
      academicYear,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = query;

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (status) {
      filter.status = status;
    }

    if (studentId) {
      filter.studentId = studentId;
    }

    if (reviewedBy) {
      filter.reviewedBy = reviewedBy;
    }

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [appeals, total] = await Promise.all([
      this.appealModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.appealModel.countDocuments(filter).exec(),
    ]);

    return {
      appeals: appeals.map(appeal => this.toAppealEntity(appeal)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single appeal by ID.
   */
  async findOne(id: string): Promise<Appeal> {
    const appeal = await this.appealModel.findOne({ id }).exec();
    if (!appeal) {
      throw new NotFoundException(`Appeal with ID ${id} not found`);
    }
    return this.toAppealEntity(appeal);
  }

  /**
   * Update an existing appeal.
   */
  async update(id: string, updateAppealDto: UpdateAppealDto): Promise<Appeal> {
    const updateData: any = {};

    if (updateAppealDto.reason !== undefined) {
      updateData.reason = updateAppealDto.reason;
    }

    if (updateAppealDto.status !== undefined) {
      updateData.status = updateAppealDto.status;
      if (updateAppealDto.status !== AppealStatus.PENDING) {
        updateData.reviewedAt = new Date();
      }
    }

    if (updateAppealDto.reviewedBy !== undefined) {
      updateData.reviewedBy = updateAppealDto.reviewedBy;
    }

    if (updateAppealDto.reviewNotes !== undefined) {
      updateData.reviewNotes = updateAppealDto.reviewNotes;
    }

    if (updateAppealDto.academicYear !== undefined) {
      updateData.academicYear = updateAppealDto.academicYear;
    }

    const updatedAppeal = await this.appealModel.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    ).exec();

    if (!updatedAppeal) {
      throw new NotFoundException(`Appeal with ID ${id} not found`);
    }

    return this.toAppealEntity(updatedAppeal);
  }

  /**
   * Remove an appeal.
   */
  async remove(id: string): Promise<void> {
    const result = await this.appealModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Appeal with ID ${id} not found`);
    }
  }

  /**
   * Get appeal statistics.
   */
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.appealModel.countDocuments().exec(),
      this.appealModel.countDocuments({ status: AppealStatus.PENDING }).exec(),
      this.appealModel.countDocuments({ status: AppealStatus.APPROVED }).exec(),
      this.appealModel.countDocuments({ status: AppealStatus.REJECTED }).exec(),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }

  /**
   * Convert MongoDB document to Appeal entity.
   */
  private toAppealEntity(doc: AppealDocument): Appeal {
    return {
      id: doc.id,
      pointLogId: doc.pointLogId,
      studentId: doc.studentId,
      reason: doc.reason,
      status: doc.status,
      submittedAt: doc.submittedAt,
      reviewedBy: doc.reviewedBy,
      reviewedAt: doc.reviewedAt,
      reviewNotes: doc.reviewNotes,
      academicYear: doc.academicYear,
    };
  }
}