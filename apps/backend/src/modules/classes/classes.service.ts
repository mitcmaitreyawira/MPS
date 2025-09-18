import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../../database/schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { CacheService } from '../../common/services/cache.service';
import { PerformanceService } from '../../common/services/performance.service';
import { StructuredLoggerService } from '../../common/services/logger.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    private readonly cacheService: CacheService,
    private readonly performanceService: PerformanceService,
    private readonly logger: StructuredLoggerService,
  ) {}

  /**
   * Retrieve all classes with filtering, pagination, and sorting capabilities.
   */
  async findAll(query: QueryClassesDto): Promise<{ classes: Class[]; total: number; page: number; limit: number }> {
    const timerId = 'findAllClasses-' + Date.now();
    this.performanceService.startTimer(timerId, { query });

    try {
      // Build filter query
      const filter: any = {};
      if (query.search) {
        filter.name = { $regex: query.search, $options: 'i' };
      }
      if (query.headTeacherId) {
        filter.headTeacherId = query.headTeacherId;
      }

      // Build sort and pagination
      const sort: any = {};
      sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;
      const skip = ((query.page || 1) - 1) * (query.limit || 10);

      // Execute queries
      const [classes, total] = await Promise.all([
        this.classModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(query.limit || 10)
          .populate('headTeacherId', 'firstName lastName email')
          .exec(),
        this.classModel.countDocuments(filter).exec(),
      ]);

      const result = {
        classes,
        total,
        page: query.page || 1,
        limit: query.limit || 10,
      };

      this.performanceService.endTimer(timerId, { count: classes.length });
      return result;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      this.logger.error('Failed to find classes', error instanceof Error ? error.stack : String(error), { metadata: { query } });
      throw error;
    }
  }

  /**
   * Find a single class by ID.
   */
  async findOne(id: string): Promise<Class> {
    const timerId = 'findOneClass-' + Date.now();
    this.performanceService.startTimer(timerId, { id });

    // Validate ObjectId format with detailed error message
    if (!Types.ObjectId.isValid(id)) {
      this.performanceService.endTimer(timerId, { error: true, reason: 'invalid_objectid' });
      this.logger.warn('Invalid ObjectId format provided for class lookup', {
        metadata: { 
          providedId: id, 
          expectedFormat: '24-character hexadecimal string',
          example: '507f1f77bcf86cd799439011'
        }
      });
      throw new BadRequestException(
        `Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${id}". ` +
        `Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`
      );
    }

    try {
      const classEntity = await this.classModel
        .findById(id)
        .populate('headTeacherId', 'firstName lastName email')
        .exec();

      if (!classEntity) {
        this.performanceService.endTimer(timerId, { found: false });
        throw new NotFoundException(`Class with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId, { found: true });
      return classEntity;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to find class', error instanceof Error ? error.stack : String(error), { metadata: { id } });
      throw error;
    }
  }

  /**
   * Create a new class.
   */
  async create(createClassDto: CreateClassDto): Promise<Class> {
    const timerId = 'createClass-' + Date.now();
    this.performanceService.startTimer(timerId, { name: createClassDto.name });

    try {
      // Check if class with same name already exists
      const existingClass = await this.classModel.findOne({ name: createClassDto.name }).exec();
      if (existingClass) {
        this.performanceService.endTimer(timerId, { error: true, reason: 'duplicate_name' });
        throw new ConflictException(`Class with name '${createClassDto.name}' already exists`);
      }

      const newClass = new this.classModel(createClassDto);
      const savedClass = await newClass.save();

      this.performanceService.endTimer(timerId, { success: true, classId: savedClass._id });
      this.logger.log('Class created successfully', { metadata: { classId: savedClass._id, name: createClassDto.name } });
      
      return savedClass;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to create class', error instanceof Error ? error.stack : String(error), { metadata: { createClassDto } });
      throw error;
    }
  }

  /**
   * Update an existing class.
   */
  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const timerId = 'updateClass-' + Date.now();
    this.performanceService.startTimer(timerId, { id });

    // Validate ObjectId format with detailed error message
    if (!Types.ObjectId.isValid(id)) {
      this.performanceService.endTimer(timerId, { error: true, reason: 'invalid_objectid' });
      this.logger.warn('Invalid ObjectId format provided for class update', {
        metadata: { 
          providedId: id, 
          expectedFormat: '24-character hexadecimal string',
          example: '507f1f77bcf86cd799439011'
        }
      });
      throw new BadRequestException(
        `Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${id}". ` +
        `Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`
      );
    }

    try {
      // Check if updating name to an existing name
      if (updateClassDto.name) {
        const existingClass = await this.classModel.findOne({ 
          name: updateClassDto.name, 
          _id: { $ne: id } 
        }).exec();
        if (existingClass) {
          this.performanceService.endTimer(timerId, { error: true, reason: 'duplicate_name' });
          throw new ConflictException(`Class with name '${updateClassDto.name}' already exists`);
        }
      }

      const updatedClass = await this.classModel
        .findByIdAndUpdate(id, updateClassDto, { new: true })
        .populate('headTeacherId', 'firstName lastName email')
        .exec();

      if (!updatedClass) {
        this.performanceService.endTimer(timerId, { error: true, reason: 'not_found' });
        throw new NotFoundException(`Class with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId, { success: true, classId: id });
      this.logger.log('Class updated successfully', { metadata: { classId: id, updates: updateClassDto } });
      
      return updatedClass;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to update class', error instanceof Error ? error.stack : String(error), { metadata: { id, updateClassDto } });
      throw error;
    }
  }

  /**
   * Delete a class by ID.
   */
  async remove(id: string): Promise<void> {
    const timerId = 'removeClass-' + Date.now();
    this.performanceService.startTimer(timerId, { id });

    // Validate ObjectId format with detailed error message
    if (!Types.ObjectId.isValid(id)) {
      this.performanceService.endTimer(timerId, { error: true, reason: 'invalid_objectid' });
      this.logger.warn('Invalid ObjectId format provided for class deletion', {
        metadata: { 
          providedId: id, 
          expectedFormat: '24-character hexadecimal string',
          example: '507f1f77bcf86cd799439011'
        }
      });
      throw new BadRequestException(
        `Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${id}". ` +
        `Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`
      );
    }

    try {
      const deletedClass = await this.classModel.findByIdAndDelete(id).exec();

      if (!deletedClass) {
        this.performanceService.endTimer(timerId, { error: true, reason: 'not_found' });
        throw new NotFoundException(`Class with ID ${id} not found`);
      }

      this.performanceService.endTimer(timerId, { success: true, classId: id });
      this.logger.log('Class deleted successfully', { metadata: { classId: id, name: deletedClass.name } });
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete class', error instanceof Error ? error.stack : String(error), { metadata: { id } });
      throw error;
    }
  }
}