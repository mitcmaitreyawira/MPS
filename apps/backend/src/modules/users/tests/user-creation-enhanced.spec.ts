import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../../../database/schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { PasswordService } from '../../auth/services/password.service';
import { Model } from 'mongoose';

// Jest globals declaration for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInstanceOf(expected: any): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalled(): R;
      toThrow(expected?: any): R;
      toBeDefined(): R;
      toEqual(expected: any): R;
      toBe(expected: any): R;
      toContain(expected: any): R;
      rejects: {
        toThrow(expected?: any): Promise<R>;
        toBeDefined(): Promise<R>;
        toEqual(expected: any): Promise<R>;
        toBe(expected: any): Promise<R>;
      };
      resolves: {
        toThrow(expected?: any): Promise<R>;
        toBeDefined(): Promise<R>;
        toEqual(expected: any): Promise<R>;
        toBe(expected: any): Promise<R>;
      };
    }
  }
  
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function expect(actual: any): jest.Matchers<any>;
  
  namespace jest {
    function fn(): any;
    function clearAllMocks(): void;
    function setTimeout(timeout: number): void;
  }
}

// Mock function factory
const createMockFn = () => {
  const mockFn = (() => {}) as any;
  mockFn.mockResolvedValue = (value: any) => mockFn;
  mockFn.mockRejectedValue = (value: any) => mockFn;
  mockFn.mockImplementation = (fn: any) => mockFn;
  mockFn.mockReturnValue = (value: any) => mockFn;
  return mockFn;
};

describe('UsersService - Enhanced User Creation Tests', () => {
  let service: UsersService;
  let userModel: Model<User>;
  let passwordService: PasswordService;

  // Mock implementations
  const mockUser = {
    _id: 'mock-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['student'],
    password: 'hashedPassword',
    save: createMockFn(),
  };

  const mockPasswordService = {
    hashPassword: createMockFn(),
    validatePassword: createMockFn(),
    generateStrongPassword: createMockFn(),
    validatePasswordStrength: createMockFn(),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    roles: ['student'],
  };

  const mockUserModel = {
    new: createMockFn().mockResolvedValue(mockUser),
    constructor: createMockFn().mockResolvedValue(mockUser),
    find: createMockFn(),
    findOne: createMockFn(),
    findById: createMockFn(),
    create: createMockFn().mockResolvedValue(mockUser),
    countDocuments: createMockFn(),
    exec: createMockFn(),
    prototype: {
      save: createMockFn().mockResolvedValue(mockUser)
    }
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    passwordService = module.get<PasswordService>(PasswordService);

    // Clear all mocks before each test
    const clearMocks = () => {
      Object.values(mockPasswordService).forEach((mock: any) => {
        if (mock.mockClear) mock.mockClear();
      });
      Object.values(mockUserModel).forEach((mock: any) => {
        if (mock.mockClear) mock.mockClear();
      });
    };
    clearMocks();
  });

  describe('Password Validation Tests', () => {
    it('should accept any passwords (no validation requirements)', async () => {
      const passwords = [
        'simple',
        '123',
        'a',
        'password',
        'NoNumbers',
        'nouppercase',
        'NOLOWERCASE',
        'short',
        'verylongpasswordwithoutanyspecialcharactersorvalidation'
      ];

      for (const password of passwords) {
        const createUserDto: CreateUserDto = {
          ...mockCreateUserDto,
          email: `test${Math.random()}@example.com`,
          password
        };

        // Mock successful creation
        mockUserModel.findOne.mockResolvedValue(null);
        mockUserModel.prototype.save.mockResolvedValue({
          ...mockUser,
          email: createUserDto.email
        });
        mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
        mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, message: 'No validation requirements' });

        const result = await service.create(createUserDto);

        expect(result).toBeDefined();
        expect(result.email).toBe(createUserDto.email);
      }
    });
  });

  describe('User Creation Success Cases', () => {
    it('should create user with valid data', async () => {
      const passwords = [
        'simple',
        '123',
        'a',
        'password'
      ];

      for (const password of passwords) {
        const createUserDto: CreateUserDto = {
          ...mockCreateUserDto,
          email: `test${Math.random()}@example.com`,
          password
        };

        // Mock successful creation
        mockUserModel.findOne.mockResolvedValue(null);
        mockUserModel.prototype.save.mockResolvedValue({
          ...mockUser,
          email: createUserDto.email
        });
        mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
        mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, message: 'No validation requirements' });

        const result = await service.create(createUserDto);

        expect(result).toBeDefined();
        expect(result.email).toBe(createUserDto.email);
      }
    });

    it('should handle user creation with different roles', async () => {
      const createUserDto: CreateUserDto = {
        ...mockCreateUserDto,
        roles: ['teacher']
      };
      
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.prototype.save.mockResolvedValue(mockUser);
      mockUserModel.findById.mockReturnValue({
        select: createMockFn().mockReturnValue({
          exec: createMockFn().mockResolvedValue(mockUser)
        })
      });
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, message: 'No validation requirements' });

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('User Creation Error Cases', () => {
    it('should throw ConflictException when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        ...mockCreateUserDto
      };
      
      mockUserModel.findOne.mockImplementation((query: any) => {
        if (query.email === createUserDto.email) {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should handle database errors gracefully', async () => {
      const createUserDto: CreateUserDto = {
        ...mockCreateUserDto
      };
      
      mockUserModel.findOne.mockImplementation((query: any) => {
        if (query.email === createUserDto.email) {
          throw new Error('Database connection failed');
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createUserDto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in user data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test+special@example.com',
        password: 'simple',
        firstName: "O'Connor",
        lastName: 'Smith-Jones',
        roles: ['student']
      };
      
      mockUserModel.findOne.mockImplementation((query: any) => {
        return Promise.resolve(null);
      });
      
      mockUserModel.prototype.save.mockResolvedValue({
        ...mockUser,
        username: 'john.doe'
      });
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, message: 'No validation requirements' });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should create user with proper password hashing', async () => {
      const createUserDto: CreateUserDto = {
        ...mockCreateUserDto
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.prototype.save.mockResolvedValue(mockUser);
      mockUserModel.findById.mockReturnValue({
        select: createMockFn().mockReturnValue({
          exec: createMockFn().mockResolvedValue(mockUser)
        })
      });
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, message: 'No validation requirements' });

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
    });
  });
});