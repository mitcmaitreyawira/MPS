import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { CacheService } from '../../common/services/cache.service';
import { PerformanceService } from '../../common/services/performance.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<Model<User>>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    roles: ['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
    select: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: CacheService,
          useValue: {
            del: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            invalidatePattern: jest.fn(),
          },
        },
        {
          provide: PerformanceService,
          useValue: {
            startTimer: jest.fn().mockReturnValue('timer-id'),
            endTimer: jest.fn(),
            endTimerSuccess: jest.fn(),
            endTimerError: jest.fn(),
            trackDatabaseOperation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name)) as jest.Mocked<Model<User>>;

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with default parameters', async () => {
      const query: QueryUsersDto = {};
      const mockUsers = [mockUser];
      const mockTotal = 1;

      // Mock the chained methods
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers),
      };

      userModel.find.mockReturnValue(mockQuery as any);
      userModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTotal) } as any);

      const result = await service.findAll(query);

      expect(result).toEqual({
        users: mockUsers,
        total: mockTotal,
        page: 1,
        limit: 10,
      });
      expect(userModel.find).toHaveBeenCalledWith({});
    });

    it('should apply search filter correctly', async () => {
      const query: QueryUsersDto = { search: 'john' };
      const expectedFilter = {
        $or: [
          { firstName: { $regex: 'john', $options: 'i' } },
          { lastName: { $regex: 'john', $options: 'i' } },
          { email: { $regex: 'john', $options: 'i' } },
        ],
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      userModel.find.mockReturnValue(mockQuery as any);
      userModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) } as any);

      await service.findAll(query);

      expect(userModel.find).toHaveBeenCalledWith(expectedFilter);
    });

    it('should apply role filter correctly', async () => {
      const query: QueryUsersDto = { role: 'admin' };
      const expectedFilter = { roles: { $in: ['admin'] } };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      userModel.find.mockReturnValue(mockQuery as any);
      userModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) } as any);

      await service.findAll(query);

      expect(userModel.find).toHaveBeenCalledWith(expectedFilter);
    });
  });

  describe('findOne', () => {
    it('should return a user when valid ID is provided', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      userModel.findById.mockReturnValue(mockQuery as any);

      const result = await service.findOne(validId);

      expect(result).toEqual(mockUser);
      expect(userModel.findById).toHaveBeenCalledWith(validId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(service.findOne(invalidId)).rejects.toThrow(BadRequestException);
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      userModel.findById.mockReturnValue(mockQuery as any);

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      firstName: 'Jane',
      lastName: 'Smith',
      roles: ['user'],
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = { ...mockUser, _id: 'newUserId' };
      const { password, ...returnedUser } = savedUser;

      // Mock existing user check
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      
      // Mock bcrypt
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      // Mock user creation
      const mockSave = jest.fn().mockResolvedValue(savedUser);
      const mockConstructor = jest.fn().mockImplementation(() => ({ save: mockSave }));
      (userModel as any).mockImplementation = mockConstructor;
      
      // Mock findById for returning user without password
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(returnedUser),
      };
      userModel.findById.mockReturnValue(mockQuery as any);

      // Create a mock constructor function
      const MockUserModel = function(userData: any) {
        return { save: mockSave };
      } as any;
      
      // Replace the userModel with our mock constructor
      (service as any).userModel = MockUserModel;
      MockUserModel.findOne = userModel.findOne;
      MockUserModel.findById = userModel.findById;

      const result = await service.create(createUserDto);

      expect(result).toEqual(returnedUser);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should handle profile with dateOfBirth transformation', async () => {
      const createUserDtoWithProfile: CreateUserDto = {
        ...createUserDto,
        profile: {
          bio: 'Test bio',
          dateOfBirth: '1990-01-01',
        },
      };

      const hashedPassword = 'hashedPassword123';
      const savedUser = { ...mockUser, _id: 'newUserId' };
      const { password, ...returnedUser } = savedUser;

      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const mockSave = jest.fn().mockResolvedValue(savedUser);
      const MockUserModel = function(userData: any) {
        // Verify that dateOfBirth was transformed to Date
        expect(userData.profile.dateOfBirth).toBeInstanceOf(Date);
        return { save: mockSave };
      } as any;
      
      (service as any).userModel = MockUserModel;
      MockUserModel.findOne = userModel.findOne;
      MockUserModel.findById = userModel.findById;

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(returnedUser),
      };
      userModel.findById.mockReturnValue(mockQuery as any);

      await service.create(createUserDtoWithProfile);

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const validId = '507f1f77bcf86cd799439011';
    const updateUserDto: UpdateUserDto = {
      firstName: 'UpdatedName',
      lastName: 'UpdatedLastName',
    };

    it('should update user successfully', async () => {
      const { password, ...updatedUser } = { ...mockUser, ...updateUserDto };

      // Mock existing user check
      userModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) } as any);
      
      // Mock update
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser),
      };
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

      const result = await service.update(validId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        validId,
        expect.objectContaining(updateUserDto),
        { new: true }
      );
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(service.update(invalidId, updateUserDto)).rejects.toThrow(BadRequestException);
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.update(validId, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email conflicts with another user', async () => {
      const updateWithEmail: UpdateUserDto = { email: 'existing@example.com' };
      const existingUser = { ...mockUser };
      const conflictUser = { ...mockUser, _id: 'differentId', email: 'existing@example.com' };

      userModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) } as any);
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(conflictUser) } as any);

      await expect(service.update(validId, updateWithEmail)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('should remove user successfully', async () => {
      userModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) } as any);

      await expect(service.remove(validId)).resolves.not.toThrow();
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(validId);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(service.remove(invalidId)).rejects.toThrow(BadRequestException);
      expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.remove(validId)).rejects.toThrow(NotFoundException);
    });
  });
});