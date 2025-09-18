import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from '../../database/schemas/user.schema';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { CacheService } from '../../common/services/cache.service';
import { PerformanceService } from '../../common/services/performance.service';
import { ErrorResponseService } from '../../common/services/error-response.service';
import { UserDataTransformer } from './helpers/user-data-transformer.helper';
import { UserValidationHelper } from './helpers/user-validation.helper';
import { UserPerformanceHelper } from './helpers/user-performance.helper';
import { UserCacheHelper } from './helpers/user-cache.helper';
import { PointLogsService } from '../points/point-logs.service';
import { PointType } from '../points/entities/point-log.entity';
import { AuditService } from '../auth/services/audit.service';
import { AuditAction } from '../auth/enums/audit-action.enum';

/**
 * UsersService encapsulates data access logic for the User model with
 * comprehensive validation, filtering, pagination, and security measures.
 */
@Injectable()
export class UsersService {
  private readonly performanceHelper: UserPerformanceHelper;
  private readonly cacheHelper: UserCacheHelper;
  private readonly validationHelper: UserValidationHelper;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private connection: Connection,
    private cacheService: CacheService,
    private performanceService: PerformanceService,
    private errorResponseService: ErrorResponseService,
    private pointLogsService: PointLogsService,
    private auditService: AuditService,
  ) {
    this.performanceHelper = new UserPerformanceHelper(performanceService);
    this.cacheHelper = new UserCacheHelper(cacheService);
    this.validationHelper = new UserValidationHelper(userModel);
  }

  /**
   * Execute database operations with proper transaction safety.
   * Handles session management, commit/abort logic, and cache invalidation.
   */
  private async executeWithTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    operationName: string,
    invalidateCache: boolean = true
  ): Promise<T> {
    const session = await this.connection.startSession();
    
    try {
      session.startTransaction();
      
      const result = await operation(session);
      
      await session.commitTransaction();
      
      // Invalidate cache after successful transaction
      if (invalidateCache) {
        try {
          await this.cacheHelper.invalidateUsersListCache();
        } catch (cacheError) {
          console.warn(`Cache invalidation failed after ${operationName}:`, cacheError);
        }
      }
      
      return result;
    } catch (error) {
      await session.abortTransaction();
      console.error(`Failed to execute ${operationName}:`, error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Execute database operations without transactions (fallback for standalone MongoDB).
   */
  private async executeWithoutTransaction<T>(
    operation: () => Promise<T>,
    operationName: string,
    invalidateCache: boolean = true
  ): Promise<T> {
    try {
      const result = await operation();
      
      // Invalidate cache after successful operation
      if (invalidateCache) {
        try {
          await this.cacheHelper.invalidateUsersListCache();
        } catch (cacheError) {
          console.warn(`Cache invalidation failed after ${operationName}:`, cacheError);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to execute ${operationName}:`, error);
      throw error;
    }
  }

  /**
   * Find all non-archived students by class ID.
   */
  async findByClassId(classId: string): Promise<User[]> {
    const timerId = `findUsersByClass-${Date.now()}`;
    this.performanceService.startTimer(timerId, { classId });

    try {
      const dbStartTime = Date.now();
      const users = await this.userModel
        .find({ classId, isArchived: { $ne: true }, roles: 'student' })
        .select('-password')
        .populate('classId', 'name _id')
        .exec();
      const dbDuration = Date.now() - dbStartTime;

      this.performanceService.trackDatabaseOperation('find', 'users', dbDuration, {
        count: users.length,
        classId,
      });

      this.performanceService.endTimer(timerId, { success: true, count: users.length });
      return users;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    }
  }

  /**
   * Retrieve all users with advanced filtering, pagination, and sorting capabilities.
   * 
   * @param query - Query parameters for filtering, pagination, and sorting
   * @returns Promise resolving to paginated user results with metadata
   * 
   * @example
   * ```typescript
   * const result = await usersService.findAll({
   *   page: 1,
   *   limit: 10,
   *   search: 'john',
   *   role: 'admin',
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  async findAll(query: QueryUsersDto): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const timerId = this.performanceHelper.startTimer('findAllUsers', { query });

    try {
      // Try to get from cache first using helper
      const cached = await this.cacheHelper.getUsersListFromCache(query);
      if (cached) {
        this.performanceService.endTimer(timerId, { cached: true, count: cached.users.length });
        return cached;
      }

      // Build filter query using helper
      const filter = UserDataTransformer.buildFilterQuery(query);
      
      // Build sort and pagination using helper
      const { sort, skip, selectFields } = UserDataTransformer.buildQueryOptions(query);

      // Execute queries with performance tracking
      const dbStartTime = Date.now();
      const [users, total] = await Promise.all([
        this.userModel
          .find(filter)
          .select(selectFields)
          .sort(sort)
          .skip(skip)
          .limit(query.limit || 10)
          .populate('classId', 'name _id')
          .exec(),
        this.userModel.countDocuments(filter).exec(),
      ]);
      const dbDuration = Date.now() - dbStartTime;
      
      this.performanceService.trackDatabaseOperation('find', 'users', dbDuration, {
        count: users.length,
        total,
        page: query.page || 1,
        limit: query.limit || 10,
      });

      const result = {
        users,
        total,
        page: query.page || 1,
        limit: query.limit || 10,
      };

      // Cache the result using helper
      await this.cacheHelper.cacheUsersList(query, result);

      this.performanceService.endTimer(timerId, { cached: false, count: users.length });
      return result;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    }
  }

  /**
   * Retrieves a single user by their unique identifier.
   * Implements caching for improved performance.
   * 
   * @param id - The unique identifier of the user to retrieve
   * @returns Promise resolving to the user object
   * @throws NotFoundException when user with given ID doesn't exist
   * @throws BadRequestException when ID format is invalid
   * 
   * @example
   * ```typescript
   * const user = await usersService.findOne('507f1f77bcf86cd799439011');
   * console.log(user.email); // 'john.doe@example.com'
   * ```
   */
  async findOne(id: string): Promise<User> {
    // Validate user ID using helper
    UserValidationHelper.validateUserId(id);

    const timerId = `findOne-${id}`;
    this.performanceService.startTimer(timerId, { userId: id });

    try {
      // Try to get from cache first using helper
      const cachedUser = await this.cacheHelper.getUserFromCache(id);
      
      if (cachedUser) {
        this.performanceService.endTimer(timerId, { cacheHit: true });
        return cachedUser;
      }

      // If not in cache, query database with performance tracking
      const dbStartTime = Date.now();
      const user = await this.userModel.findById(id).select('-password').populate('classId', 'name _id').exec();
      const dbDuration = Date.now() - dbStartTime;
      
      this.performanceService.trackDatabaseOperation('findById', 'users', dbDuration, {
        userId: id,
        found: !!user,
      });
      
      if (!user) {
        this.performanceService.endTimer(timerId, { found: false });
        throw new NotFoundException('User not found');
      }

      // Cache the result using helper
      await this.cacheHelper.cacheUser(id, user);
      
      this.performanceService.endTimer(timerId, { cacheHit: false, found: true });
      return user;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    }
  }

  /**
   * Create a new user with comprehensive validation and security measures.
   * 
   * @param createUserDto - User creation data transfer object
   * @returns Promise resolving to the created user document
   * @throws {ConflictException} When NISN already exists
   * @throws {BadRequestException} When validation fails
   * 
   * @example
   * ```typescript
   * const user = await usersService.create({
   *   email: 'user@example.com',
   *   password: 'SecurePassword123!',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   roles: ['user']
   * });
   * ```
   */
  /**
   * Create a new user with comprehensive validation and security measures.
   * 
   * @param createUserDto - User creation data transfer object
   * @returns Promise resolving to the created user document
   * @throws {ConflictException} When NISN already exists
   * @throws {BadRequestException} When validation fails
   * 
   * @example
   * ```typescript
   * const user = await usersService.create({
   *   nisn: '1234567890',
   *   password: 'SecurePassword123!',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   roles: ['student']
   * });
   * ```
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const timerId = this.performanceHelper.startTimer('createUser', { nisn: (createUserDto as any).nisn || 'no-nisn' });

    try {
      // Try transaction-based approach first (for replica sets)
      return await this.executeWithTransaction(async (session) => {
        // Normalize inputs
        if ((createUserDto as any).nisn) {
          (createUserDto as any).nisn = (createUserDto as any).nisn.trim();
        }

        // Hash password if provided
        let hashedPassword = '';
        if (createUserDto.password) {
          const saltRounds = 12;
          hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
        }

        // Transform DTO using helper
        const userData = UserDataTransformer.transformCreateDto(createUserDto, hashedPassword);

        // Create user in database with session
        const createStartTime = Date.now();
        const newUser = new this.userModel(userData);
        const savedUser = await newUser.save({ session });
        const createDuration = Date.now() - createStartTime;
        
        this.performanceService.trackDatabaseOperation('create', 'users', createDuration, {
          userId: savedUser._id.toString(),
          roles: savedUser.roles,
        });

        // Automatically grant initial points for new students within the same transaction
        if (savedUser.roles && savedUser.roles.includes('student')) {
          await this.pointLogsService.create({
            studentId: savedUser._id.toString(),
            points: 100,
            type: PointType.REWARD,
            category: 'Initial Setup',
            description: 'Welcome bonus - starting points for new student',
            addedBy: 'system',
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          });
          
          console.log(`✅ Initial 100 points granted to new student: ${savedUser.firstName} ${savedUser.lastName} (${(savedUser as any).nisn || savedUser._id})`);
        }

        // Remove password from response
        const userResponse = savedUser.toObject();
        delete (userResponse as any).password;

        return userResponse as User;
      }, 'createUser');
    } catch (transactionError: any) {
      // Fallback to non-transaction approach for standalone MongoDB
      console.warn('Transaction failed, falling back to non-transaction approach:', transactionError?.message || 'Unknown error');
      
      try {
        return await this.executeWithoutTransaction(async () => {
          // Normalize inputs
          if ((createUserDto as any).nisn) {
            (createUserDto as any).nisn = (createUserDto as any).nisn.trim();
          }

          // Hash password if provided
          let hashedPassword = '';
          if (createUserDto.password) {
            const saltRounds = 12;
            hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
          }

          // Transform DTO using helper
          const userData = UserDataTransformer.transformCreateDto(createUserDto, hashedPassword);

          // Create user in database
          const createStartTime = Date.now();
          const newUser = new this.userModel(userData);
          const savedUser = await newUser.save();
          const createDuration = Date.now() - createStartTime;
          
          this.performanceService.trackDatabaseOperation('create', 'users', createDuration, {
            userId: savedUser._id.toString(),
            roles: savedUser.roles,
          });

          // Automatically grant initial points for new students
          if (savedUser.roles && savedUser.roles.includes('student')) {
            await this.pointLogsService.create({
              studentId: savedUser._id.toString(),
              points: 100,
              type: PointType.REWARD,
              category: 'Initial Setup',
              description: 'Welcome bonus - starting points for new student',
              addedBy: 'system',
              academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            });
            
            console.log(`✅ Initial 100 points granted to new student: ${savedUser.firstName} ${savedUser.lastName} (${(savedUser as any).nisn || savedUser._id})`);
          }

          // Remove password from response
          const userResponse = savedUser.toObject();
          delete (userResponse as any).password;

          return userResponse as User;
        }, 'createUser');
      } catch (error) {
        this.performanceService.endTimer(timerId, { error: true });
        throw error;
      }
    } finally {
      this.performanceService.endTimer(timerId, { success: true });
    }
  }

  /**
   * Create multiple users in bulk with validation and error handling.
   * 
   * @param createUserDtos - Array of user creation data transfer objects
   * @returns Promise resolving to array of created users and any errors
   * 
   * @example
   * ```typescript
   * const result = await usersService.createBulk([
   *   { nisn: '12345', password: 'Pass123!', firstName: 'John', lastName: 'Doe', roles: ['student'] },
   *   { nisn: '67890', password: 'Pass123!', firstName: 'Jane', lastName: 'Smith', roles: ['teacher'] }
   * ]);
   * ```
   */
  async createBulk(createUserDtos: CreateUserDto[]): Promise<{ 
    created: User[]; 
    errors: Array<{ index: number; nisn: string; error: string }> 
  }> {
    const timerId = this.performanceHelper.startTimer('createBulkUsers', { count: createUserDtos.length });
    const created: User[] = [];
    const errors: Array<{ index: number; nisn: string; error: string }> = [];

    try {
      return await this.executeWithoutTransaction(async () => {
        for (let i = 0; i < createUserDtos.length; i++) {
          const dto = createUserDtos[i];
          if (!dto) continue;
          
          try {
            // Normalize inputs
            if ((dto as any).nisn) {
              (dto as any).nisn = (dto as any).nisn.trim();
            }

            // Hash password if provided
            let hashedPassword = '';
            if (dto.password) {
              const saltRounds = 12;
              hashedPassword = await bcrypt.hash(dto.password, saltRounds);
            }

            // Transform DTO using helper
            const userData = UserDataTransformer.transformCreateDto(dto, hashedPassword);

            // Create user in database
            const newUser = new this.userModel(userData);
            const savedUser = await newUser.save();

            // Create initial points for students within the same transaction
            if (savedUser.roles && savedUser.roles.includes('student')) {
              await this.pointLogsService.create({
                studentId: savedUser._id.toString(),
                points: 100,
                type: PointType.REWARD,
                category: 'Initial Setup',
                description: 'Welcome bonus - starting points for new student',
                addedBy: 'system',
                academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
              });
            }

            // Remove password from response
            const userResponse = savedUser.toObject();
            delete (userResponse as any).password;
            created.push(userResponse as User);
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push({
              index: i,
              nisn: (dto as any).nisn || 'N/A',
              error: errorMessage
            });
            // Continue processing other users even if one fails
          }
        }

        return { created, errors };
      }, 'createBulkUsers');
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    } finally {
      // Invalidate cache after successful transaction
      try {
        await this.cacheHelper.invalidateUsersListCache();
        this.performanceService.endTimer(timerId, { 
          success: true, 
          created: created.length, 
          errors: errors.length 
        });
      } catch (cacheError) {
        console.warn('Cache invalidation failed:', cacheError);
      }
    }
  }

  /**
   * Update an existing user with partial data and comprehensive validation.
   * 
   * @param id - MongoDB ObjectId string of the user to update
   * @param updateUserDto - Partial user data for updates
   * @returns Promise resolving to the updated user document
   * @throws {BadRequestException} When ID format is invalid or validation fails
   * @throws {NotFoundException} When user is not found
   * @throws {ConflictException} When NISN conflicts with another user
   * 
   * @example
   * ```typescript
   * const updatedUser = await usersService.update('507f1f77bcf86cd799439011', {
   *   firstName: 'Jane',
   *   preferences: { theme: 'dark' }
   * });
   * ```
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const timerId = `updateUser-${Date.now()}`;
    this.performanceService.startTimer(timerId, { userId: id });

    try {
      // Try transaction-based approach first
      return await this.executeWithTransaction(async (session) => {
        // Validate user ID using helper
        UserValidationHelper.validateUserId(id);

        // Check if user exists
        const dbStartTime = Date.now();
        const existingUser = await this.userModel.findById(id).session(session).exec();
        const dbDuration = Date.now() - dbStartTime;
        
        this.performanceService.trackDatabaseOperation('findById', 'users', dbDuration, {
          userId: id,
          found: !!existingUser,
        });
        
        if (!existingUser) {
          this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
          throw new NotFoundException('User not found');
        }

        // Normalize inputs
        if ((updateUserDto as any).nisn) {
          (updateUserDto as any).nisn = (updateUserDto as any).nisn.trim();
        }

        // Check for NISN conflicts if provided
        if ((updateUserDto as any).nisn && (updateUserDto as any).nisn !== (existingUser as any).nisn) {
          const nisnCheckStart = Date.now();
          const nisnConflict = await this.userModel.findOne({ 
            nisn: (updateUserDto as any).nisn, 
            _id: { $ne: id } 
          }).session(session).exec();
          const nisnCheckDuration = Date.now() - nisnCheckStart;

          this.performanceService.trackDatabaseOperation('findOne', 'users', nisnCheckDuration, {
            nisn: (updateUserDto as any).nisn,
            conflict: !!nisnConflict,
          });

          if (nisnConflict) {
            this.performanceService.endTimer(timerId, { error: true, reason: 'nisn_conflict' });
            const errorResponse = this.errorResponseService.createDuplicateResourceError(
              'User',
              'nisn',
              (updateUserDto as any).nisn
            );
            throw new ConflictException(errorResponse);
          }
        }

        // Transform DTO using helper
        const updateData = UserDataTransformer.transformUpdateDto(updateUserDto);

        // Update user in database with session
        const updateStartTime = Date.now();
        const updatedUser = await this.userModel
          .findByIdAndUpdate(id, updateData, { new: true, session })
          .select('-password')
          .exec();
        const updateDuration = Date.now() - updateStartTime;
        
        this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
          userId: id,
          updated: !!updatedUser,
        });
        
        if (!updatedUser) {
          this.performanceService.endTimer(timerId, { error: true, reason: 'update_failed' });
          throw new NotFoundException('User not found after update');
        }

        // Log audit trail for user update
        await this.auditService.log(
          'system', // This should be replaced with actual user ID from request context
          AuditAction.USER_UPDATED,
          'User',
          id,
          {
            updatedFields: Object.keys(updateData),
            previousValues: {
              name: existingUser.firstName && existingUser.lastName ? `${existingUser.firstName} ${existingUser.lastName}`.trim() : undefined,
              points: (existingUser as any).points,
              classId: existingUser.classId
            },
            newValues: updateData
          }
        );

        // Invalidate individual user cache
        await this.cacheHelper.invalidateUserCache(id);

        this.performanceService.endTimer(timerId, { success: true, userId: id });
        return updatedUser;
      }, 'updateUser');
    } catch (transactionError: any) {
      // Fallback to non-transaction approach
      console.warn('Transaction failed for update, falling back to non-transaction approach:', transactionError?.message || 'Unknown error');
      
      try {
        return await this.executeWithoutTransaction(async () => {
          // Validate user ID using helper
          UserValidationHelper.validateUserId(id);

          // Check if user exists
          const dbStartTime = Date.now();
          const existingUser = await this.userModel.findById(id).exec();
          const dbDuration = Date.now() - dbStartTime;
          
          this.performanceService.trackDatabaseOperation('findById', 'users', dbDuration, {
            userId: id,
            found: !!existingUser,
          });
          
          if (!existingUser) {
            this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
            throw new NotFoundException('User not found');
          }

          // Normalize inputs
          if ((updateUserDto as any).nisn) {
            (updateUserDto as any).nisn = (updateUserDto as any).nisn.trim();
          }

          // Check for NISN conflicts if provided
          if ((updateUserDto as any).nisn && (updateUserDto as any).nisn !== (existingUser as any).nisn) {
            const nisnCheckStart = Date.now();
            const nisnConflict = await this.userModel.findOne({ 
              nisn: (updateUserDto as any).nisn, 
              _id: { $ne: id } 
            }).exec();
            const nisnCheckDuration = Date.now() - nisnCheckStart;

            this.performanceService.trackDatabaseOperation('findOne', 'users', nisnCheckDuration, {
              nisn: (updateUserDto as any).nisn,
              conflict: !!nisnConflict,
            });

            if (nisnConflict) {
              this.performanceService.endTimer(timerId, { error: true, reason: 'nisn_conflict' });
              const errorResponse = this.errorResponseService.createDuplicateResourceError(
                'User',
                'nisn',
                (updateUserDto as any).nisn
              );
              throw new ConflictException(errorResponse);
            }
          }

          // Transform DTO using helper
          const updateData = UserDataTransformer.transformUpdateDto(updateUserDto);

          // Update user in database
          const updateStartTime = Date.now();
          const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .select('-password')
            .exec();
          const updateDuration = Date.now() - updateStartTime;
          
          this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
            userId: id,
            updated: !!updatedUser,
          });
          
          if (!updatedUser) {
            this.performanceService.endTimer(timerId, { error: true, reason: 'update_failed' });
            throw new NotFoundException('User not found after update');
          }

          // Log audit trail for user update
          await this.auditService.log(
            'system', // This should be replaced with actual user ID from request context
            AuditAction.USER_UPDATED,
            'User',
            id,
            {
              updatedFields: Object.keys(updateData),
              previousValues: {
                name: existingUser.firstName && existingUser.lastName ? `${existingUser.firstName} ${existingUser.lastName}`.trim() : undefined,
                points: (existingUser as any).points,
                classId: existingUser.classId
              },
              newValues: updateData
            }
          );

          // Invalidate individual user cache
          await this.cacheHelper.invalidateUserCache(id);

          this.performanceService.endTimer(timerId, { success: true, userId: id });
          return updatedUser;
        }, 'updateUser');
      } catch (error) {
        this.performanceService.endTimer(timerId, { error: true });
        throw error;
      }
    }
  }

  /**
   * Soft-archive a user (set isArchived = true).
   */
  async archive(id: string): Promise<User> {
    const timerId = `archiveUser-${Date.now()}`;
    this.performanceService.startTimer(timerId, { userId: id });

    try {
      UserValidationHelper.validateUserId(id);

      const updateStartTime = Date.now();
      const archivedUser = await this.userModel
        .findByIdAndUpdate(id, { isArchived: true }, { new: true })
        .select('-password')
        .populate('classId', 'name')
        .exec();
      const updateDuration = Date.now() - updateStartTime;

      this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
        userId: id,
        archived: !!archivedUser,
      });

      if (!archivedUser) {
        this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
        throw new NotFoundException('User not found');
      }

      await this.cacheHelper.invalidateUserCache(id);
      await this.cacheHelper.invalidateUsersListCache();

      this.performanceService.endTimer(timerId, { success: true, userId: id });
      return archivedUser;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    }
  }

  /**
   * Restore a previously archived user (set isArchived = false).
   */
  async restore(id: string): Promise<User> {
    const timerId = `restoreUser-${Date.now()}`;
    this.performanceService.startTimer(timerId, { userId: id });

    try {
      UserValidationHelper.validateUserId(id);

      const updateStartTime = Date.now();
      const restoredUser = await this.userModel
        .findByIdAndUpdate(id, { isArchived: false }, { new: true })
        .select('-password')
        .populate('classId', 'name')
        .exec();
      const updateDuration = Date.now() - updateStartTime;

      this.performanceService.trackDatabaseOperation('findByIdAndUpdate', 'users', updateDuration, {
        userId: id,
        restored: !!restoredUser,
      });

      if (!restoredUser) {
        this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
        throw new NotFoundException('User not found');
      }

      await this.cacheHelper.invalidateUserCache(id);
      await this.cacheHelper.invalidateUsersListCache();

      this.performanceService.endTimer(timerId, { success: true, userId: id });
      return restoredUser;
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    }
  }

  /**
   * Permanently delete a user from the database.
   * 
   * @param id - MongoDB ObjectId string of the user to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {BadRequestException} When ID format is invalid
   * @throws {NotFoundException} When user is not found
   * 
   * @example
   * ```typescript
   * await usersService.remove('507f1f77bcf86cd799439011');
   * ```
   */
  async remove(id: string): Promise<void> {
    const timerId = `removeUser-${Date.now()}`;
    this.performanceService.startTimer(timerId, { userId: id });

    try {
      // Validate user ID using helper
      UserValidationHelper.validateUserId(id);

      // Delete user with performance tracking
      const dbStartTime = Date.now();
      const res = await this.userModel.findByIdAndDelete(id).exec();
      const dbDuration = Date.now() - dbStartTime;
      
      this.performanceService.trackDatabaseOperation('findByIdAndDelete', 'users', dbDuration, {
        userId: id,
        deleted: !!res,
      });
      
      if (!res) {
        this.performanceService.endTimer(timerId, { error: true, reason: 'user_not_found' });
        throw new NotFoundException('User not found');
      }

      // Invalidate cache using helper
      await this.cacheHelper.invalidateUserCache(id);
      await this.cacheHelper.invalidateUsersListCache();

      this.performanceService.endTimer(timerId, { success: true, userId: id });
    } catch (error) {
      this.performanceService.endTimer(timerId, { error: true });
      throw error;
    }
  }
}