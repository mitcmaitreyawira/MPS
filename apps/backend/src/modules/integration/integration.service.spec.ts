import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IntegrationService } from './integration.service';
import { CacheService } from '../../common/services/cache.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

// Jest globals
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const beforeAll: any;
declare const afterAll: any;
declare const jest: any;
import { QuestsService } from '../quests/quests.service';
import { AppealsService } from '../appeals/appeals.service';
import { PointLogsService } from '../points/point-logs.service';
// Mock interfaces for testing - using minimal structure needed for tests
interface MockUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  classId?: string;
  isArchived?: boolean;
}

interface MockClass {
  _id: string;
  name: string;
  headTeacherId?: string;
  students: string[];
}

interface MockQuest {
  _id: string;
  title: string;
  description: string;
  pointValue: number;
  category: string;
  difficultyLevel: string;
  createdBy: string;
  targetClasses?: string[];
}

interface MockAppeal {
  _id: string;
  pointLogId: string;
  userId: string;
  reason: string;
  status: string;
}

interface MockPointLog {
  _id: string;
  userId: string;
  points: number;
  category: string;
  description: string;
  awardedBy: string;
  timestamp: Date;
}

describe('IntegrationService', () => {
  let service: IntegrationService;
  let cacheService: CacheService;
  let auditService: AuditLogsService;

  const mockConnection = {
    readyState: 1,
    db: {
      admin: () => ({
        ping: jest.fn().mockResolvedValue(true),
        serverStatus: jest.fn().mockResolvedValue({
          version: '4.4.0',
          connections: { current: 10, available: 990 },
          uptime: 1000,
        }),
      }),
    },
    startSession: jest.fn().mockResolvedValue({
      withTransaction: jest.fn(async (callback: any) => callback()),
      endSession: jest.fn(),
    }),
  };

  const mockModel = {
    countDocuments: jest.fn().mockReturnValue({
      maxTimeMS: jest.fn().mockResolvedValue(10),
    }),
    collection: {
      indexes: jest.fn().mockResolvedValue([{ name: 'id' }]),
    },
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ id: '123', name: 'Test' }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: getModelToken('User'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('Class'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('Quest'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('Appeal'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('PointLog'),
          useValue: mockModel,
        },
        {
          provide: CacheService,
          useValue: {
            set: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue({ test: true }),
            delete: jest.fn().mockResolvedValue(true),
            getStats: jest.fn().mockReturnValue({ entries: 100, hits: 90 }),
          },
        },
        {
          provide: AuditLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: QuestsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 25, quests: [], page: 1, limit: 1 }),
          },
        },
        {
          provide: AppealsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 10, appeals: [], page: 1, limit: 1 }),
          },
        },
        {
          provide: PointLogsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 200, pointLogs: [], page: 1, limit: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
    cacheService = module.get<CacheService>(CacheService);
    auditService = module.get<AuditLogsService>(AuditLogsService);
  });

  describe('verifySystemIntegration', () => {
    it('should verify all system components successfully', async () => {
      const result = await service.verifySystemIntegration();

      expect(result.success).toBe(true);
      expect(result.details.database).toBeDefined();
      expect(result.details.cache).toBeDefined();
      expect(result.details.collections).toBeDefined();
      expect(result.details.connectivity).toBeDefined();
      expect(auditService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'integration_verification',
        }),
        'system',
        'System Integration',
      );
    });

    it('should handle database connection failure', async () => {
      mockConnection.db.admin = () => {
        throw new Error('Connection failed');
      };

      const result = await service.verifySystemIntegration();

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('executeWithRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await service.executeWithRetry(operation, 'mongodb', 'test operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce('success');

      const result = await service.executeWithRetry(operation, 'mongodb', 'test operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(
        service.executeWithRetry(operation, 'mongodb', 'test operation'),
      ).rejects.toThrow('Persistent failure');

      expect(operation).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });
  });

  describe('getConnectionPoolStatus', () => {
    it('should return connection pool status', () => {
      const pools = service.getConnectionPoolStatus();

      expect(pools.size).toBeGreaterThan(0);
      expect(pools.has('mongodb')).toBe(true);
      expect(pools.has('cache')).toBe(true);
    });
  });

  describe('resetConnectionPool', () => {
    it('should reset connection pool successfully', async () => {
      await service.resetConnectionPool('mongodb');

      const pools = service.getConnectionPoolStatus();
      const mongoPool = pools.get('mongodb');

      expect(mongoPool?.status).toBe('idle');
      expect(mongoPool?.retryCount).toBe(0);
    });
  });
});

describe('IntegrationService - Integration Tests', () => {
  let service: IntegrationService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        IntegrationService,
        {
          provide: getConnectionToken(),
          useValue: {
            readyState: 1,
            db: {
              admin: () => ({
                ping: jest.fn().mockResolvedValue(true),
                serverStatus: jest.fn().mockResolvedValue({
                  version: '4.4.0',
                  connections: { current: 10, available: 990 },
                  uptime: 1000,
                }),
              }),
            },
            startSession: jest.fn().mockResolvedValue({
              withTransaction: jest.fn(async (callback: any) => callback()),
              endSession: jest.fn(),
            }),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            countDocuments: jest.fn().mockReturnValue({
              maxTimeMS: jest.fn().mockResolvedValue(100),
            }),
            collection: {
              indexes: jest.fn().mockResolvedValue([{ name: 'id' }, { name: 'email' }]),
            },
            findOne: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue({ id: '123', email: 'test@example.com' }),
            }),
          },
        },
        {
          provide: getModelToken('Class'),
          useValue: {
            countDocuments: jest.fn().mockReturnValue({
              maxTimeMS: jest.fn().mockResolvedValue(50),
            }),
            collection: {
              indexes: jest.fn().mockResolvedValue([{ name: 'id' }]),
            },
          },
        },
        {
          provide: getModelToken('Quest'),
          useValue: {
            countDocuments: jest.fn().mockReturnValue({
              maxTimeMS: jest.fn().mockResolvedValue(25),
            }),
            collection: {
              indexes: jest.fn().mockResolvedValue([{ name: 'id' }]),
            },
          },
        },
        {
          provide: getModelToken('Appeal'),
          useValue: {
            countDocuments: jest.fn().mockReturnValue({
              maxTimeMS: jest.fn().mockResolvedValue(10),
            }),
            collection: {
              indexes: jest.fn().mockResolvedValue([{ name: 'id' }]),
            },
          },
        },
        {
          provide: getModelToken('PointLog'),
          useValue: {
            countDocuments: jest.fn().mockReturnValue({
              maxTimeMS: jest.fn().mockResolvedValue(200),
            }),
            collection: {
              indexes: jest.fn().mockResolvedValue([{ name: 'id' }, { name: 'userId' }]),
            },
          },
        },
        {
          provide: CacheService,
          useValue: {
            set: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue({ test: true }),
            delete: jest.fn().mockResolvedValue(true),
            getStats: jest.fn().mockReturnValue({ entries: 100, hits: 90, misses: 10 }),
          },
        },
        {
          provide: AuditLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: QuestsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 25, quests: [], page: 1, limit: 1 }),
          },
        },
        {
          provide: AppealsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 10, appeals: [], page: 1, limit: 1 }),
          },
        },
        {
          provide: PointLogsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 200, pointLogs: [], page: 1, limit: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should perform full system integration verification', async () => {
    const result = await service.verifySystemIntegration();

    expect(result.success).toBe(true);
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.duration).toBeGreaterThan(0);
    
    // Check database verification
    expect(result.details.database).toMatchObject({
      status: 'connected',
      readyState: 1,
      version: '4.4.0',
    });

    // Check cache verification
    expect(result.details.cache).toMatchObject({
      status: 'operational',
      operations: ['set', 'get', 'delete'],
      testResult: true,
    });

    // Check collections verification
    expect(result.details.collections).toMatchObject({
      users: { accessible: true, count: 100, indexCount: 2 },
      classes: { accessible: true, count: 50, indexCount: 1 },
      quests: { accessible: true, count: 25 },
      appeals: { accessible: true, count: 10 },
      pointLogs: { accessible: true, count: 200 },
    });

    // Check connectivity verification
    expect(result.details.connectivity).toMatchObject({
      databaseToCache: true,
      cacheToDatabase: true,
      transactionSupport: true,
    });
  });
});
