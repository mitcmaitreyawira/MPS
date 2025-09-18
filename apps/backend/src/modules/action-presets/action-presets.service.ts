import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionPreset } from '../../database/schemas/action-preset.schema';
import { CreateActionPresetDto, UpdateActionPresetDto, QueryActionPresetsDto } from './dto';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';

@Injectable()
export class ActionPresetsService {
  constructor(
    @InjectModel(ActionPreset.name) private actionPresetModel: Model<ActionPreset>,
    private readonly logger: StructuredLoggerService,
    private readonly performanceService: PerformanceService,
  ) {}

  async findAll(query: QueryActionPresetsDto) {
    const timerId = `findAllActionPresets_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const { page = 1, limit = 10, search, type, category, isArchived = false, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter: any = { isArchived };
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      
      if (type) {
        filter.type = type;
      }
      
      if (category) {
        filter.category = { $regex: category, $options: 'i' };
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [actionPresets, total] = await Promise.all([
        this.actionPresetModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('createdBy', 'name email')
          .exec(),
        this.actionPresetModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.performanceService.endTimer(timerId);
      this.logger.log('Action presets retrieved successfully', {
        metadata: {
          query,
          total,
          page,
          totalPages,
        },
      });

      return {
        data: actionPresets,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to retrieve action presets', error instanceof Error ? error.stack : String(error), {
        metadata: { query },
      });
      throw error;
    }
  }

  async findOne(id: string) {
    const timerId = `findOneActionPreset_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const actionPreset = await this.actionPresetModel
        .findById(id)
        .populate('createdBy', 'name email')
        .exec();

      if (!actionPreset) {
        throw new NotFoundException(`Action preset with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId);
      this.logger.log('Action preset retrieved successfully', {
        metadata: { id },
      });

      return actionPreset;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to retrieve action preset', error instanceof Error ? error.stack : String(error), {
        metadata: { id },
      });
      throw error;
    }
  }

  async create(createActionPresetDto: CreateActionPresetDto) {
    const timerId = `createActionPreset_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      // Check for duplicate name
      const existingActionPreset = await this.actionPresetModel
        .findOne({ name: createActionPresetDto.name, isArchived: false })
        .exec();

      if (existingActionPreset) {
        throw new ConflictException(`Action preset with name '${createActionPresetDto.name}' already exists`);
      }

      const actionPreset = new this.actionPresetModel(createActionPresetDto);
      const savedActionPreset = await actionPreset.save();

      // Populate the createdBy field
      await savedActionPreset.populate('createdBy', 'name email');

      this.performanceService.endTimer(timerId);
      this.logger.log('Action preset created successfully', {
        metadata: {
          createActionPresetDto,
          actionPresetId: savedActionPreset._id,
        },
      });

      return savedActionPreset;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to create action preset', error instanceof Error ? error.stack : String(error), {
        metadata: { createActionPresetDto },
      });
      throw error;
    }
  }

  async update(id: string, updateActionPresetDto: UpdateActionPresetDto) {
    const timerId = `updateActionPreset_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      // Check if action preset exists
      const existingActionPreset = await this.actionPresetModel.findById(id).exec();
      if (!existingActionPreset) {
        throw new NotFoundException(`Action preset with ID ${id} not found`);
      }

      // Check for duplicate name if name is being updated
      if (updateActionPresetDto.name && updateActionPresetDto.name !== existingActionPreset.name) {
        const duplicateActionPreset = await this.actionPresetModel
          .findOne({ 
            name: updateActionPresetDto.name, 
            _id: { $ne: id },
            isArchived: false 
          })
          .exec();

        if (duplicateActionPreset) {
          throw new ConflictException(`Action preset with name '${updateActionPresetDto.name}' already exists`);
        }
      }

      const updatedActionPreset = await this.actionPresetModel
        .findByIdAndUpdate(id, updateActionPresetDto, { new: true })
        .populate('createdBy', 'name email')
        .exec();

      this.performanceService.endTimer(timerId);
      this.logger.log('Action preset updated successfully', {
        metadata: {
          id,
          updateActionPresetDto,
        },
      });

      return updatedActionPreset;
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to update action preset', error instanceof Error ? error.stack : String(error), {
        metadata: { id, updateActionPresetDto },
      });
      throw error;
    }
  }

  async remove(id: string) {
    const timerId = `removeActionPreset_${Date.now()}`;
    this.performanceService.startTimer(timerId);

    try {
      const actionPreset = await this.actionPresetModel.findById(id).exec();
      if (!actionPreset) {
        throw new NotFoundException(`Action preset with ID ${id} not found`);
      }

      await this.actionPresetModel.findByIdAndDelete(id).exec();

      this.performanceService.endTimer(timerId);
      this.logger.log('Action preset deleted successfully', {
        metadata: { id },
      });

      return { message: 'Action preset deleted successfully' };
    } catch (error) {
      this.performanceService.endTimer(timerId);
      this.logger.error('Failed to delete action preset', error instanceof Error ? error.stack : String(error), {
        metadata: { id },
      });
      throw error;
    }
  }
}