import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { User } from '../../database/schemas/user.schema';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userModel: any;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    profile: {},
    preferences: {},
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userModel = module.get(getModelToken(User.name));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword';
      const userWithPassword = { ...mockUser, password: hashedPassword };
      
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPassword),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validate(email, password);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual(userWithPassword);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword';
      const userWithPassword = { ...mockUser, password: hashedPassword };
      
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPassword),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('signJwt', () => {
    it('should return a JWT token', async () => {
      const expectedToken = 'jwt.token.here';
      
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.signJwt(mockUser as any);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        roles: mockUser.roles,
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('sanitize', () => {
    it('should remove sensitive fields from user object', () => {
      const userWithSensitiveData = {
        ...mockUser,
        password: 'hashedPassword',
        __v: 0,
      };

      const result = service.sanitize(userWithSensitiveData);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('__v');
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('firstName', mockUser.firstName);
      expect(result).toHaveProperty('lastName', mockUser.lastName);
    });
  });

  describe('cookieOptions', () => {
    it('should return production cookie options when NODE_ENV is production', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'NODE_ENV':
            return 'production';
          case 'COOKIE_DOMAIN':
            return 'example.com';
          default:
            return undefined;
        }
      });

      const result = service.cookieOptions();

      expect(result).toEqual({
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        domain: 'example.com',
        path: '/',
      });
    });

    it('should return development cookie options when NODE_ENV is not production', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'NODE_ENV':
            return 'development';
          case 'COOKIE_DOMAIN':
            return 'localhost';
          default:
            return undefined;
        }
      });

      const result = service.cookieOptions();

      expect(result).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        domain: 'localhost',
        path: '/',
      });
    });
  });
});