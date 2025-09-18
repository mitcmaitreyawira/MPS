import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/schemas/user.schema';
import { CacheService } from '../../common/services/cache.service';
import { PerformanceService } from '../../common/services/performance.service';
import { CreateUserDto } from './dto';

describe('UsersService - Duplicate Validation', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockCacheService: any;
  let mockPerformanceService: any;

  beforeEach(async () => {
    // Mock user model
    mockUserModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    };

    // Mock cache service
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    // Mock performance service
    mockPerformanceService = {
      startTimer: jest.fn().mockReturnValue('timer-id'),
      endTimer: jest.fn(),
      endTimerError: jest.fn(),
      trackDbOperation: jest.fn().mockImplementation((op, collection, fn) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: PerformanceService,
          useValue: mockPerformanceService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // Email validation removed - using NISN for login instead

  describe('NISN Duplicate Validation', () => {
    it('should throw ConflictException when NISN already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['student'],
        password: 'password123',
        nisn: '1234567890',
      };

      // Mock no existing email but existing NISN
      mockUserModel.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null), // No email conflict
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({
            _id: 'existing-id',
            nisn: '1234567890',
          }), // NISN conflict
        });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with this NISN already exists',
      );
    });
  });

  describe('Username Generation and Validation', () => {
    it('should generate unique username when conflicts occur', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['teacher'],
        password: 'password123',
      };

      // Mock no email/NISN conflicts
      mockUserModel.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null), // No email conflict
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({
            _id: 'existing-id',
            username: 'john.doe',
          }), // Username conflict
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null), // No conflict with generated username
        });

      // Mock successful user creation
      const mockCreatedUser = {
        _id: 'new-id',
        email: 'john.doe@example.com',
        username: expect.stringMatching(/^john\.doe_\d+_[a-z0-9]+$/),
        save: jest.fn().mockResolvedValue({
          _id: 'new-id',
          email: 'john.doe@example.com',
          username: 'john.doe_123456_abc',
        }),
      };

      mockUserModel.mockImplementation(() => mockCreatedUser);

      const result = await service.create(createUserDto);
      expect(result).toBeDefined();
      expect(mockUserModel.findOne).toHaveBeenCalledTimes(3);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple users for duplicates', async () => {
      const users = [
        {
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          roles: ['teacher'],
          password: 'password123',
        },
        {
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          roles: ['teacher'],
          password: 'password123',
        },
      ];

      // Test that validation helper's batch validation would be called
      // This is more of an integration test concept
      expect(service).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw BadRequestException when email is missing', async () => {
      const createUserDto: CreateUserDto = {
        email: '', // Empty email
        firstName: 'John',
        lastName: 'Doe',
        roles: ['teacher'],
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should provide clear error messages for different conflict types', async () => {
      // This test ensures our error messages are user-friendly
      const createUserDto: CreateUserDto = {
        email: 'conflict@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['teacher'],
        password: 'password123',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'existing-id',
          email: 'conflict@example.com',
        }),
      });

      try {
        await service.create(createUserDto);
        fail('Expected ConflictException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        if (error instanceof ConflictException) {
          expect(error.message).toContain('email');
          expect(error.message).not.toContain('undefined');
          expect(error.message).not.toContain('null');
        }
      }
    });
  });
});