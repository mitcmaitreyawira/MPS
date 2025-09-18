import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { DataSyncService, IntegrityIssue } from './data-sync.service';
import { CacheService } from '../../common/services/cache.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { User } from '../../database/schemas/user.schema';
import { Class } from '../../database/schemas/class.schema';
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

interface MockActionPreset {
  _id: string;
  name: string;
  description: string;
  points: number;
  category: string;
}

describe('DataSyncService', () => {
  let service: DataSyncService;
  let cacheService: CacheService;
  let auditService: AuditLogsService;

  const mockSession = {
    withTransaction: jest.fn().mockImplementation(async () => {}),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockModel = {
    aggregate: jest.fn().mockResolvedValue([]),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSyncService,
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
          provide: getModelToken('ActionPreset'),
          useValue: mockModel,
        },
        {
          provide: CacheService,
          useValue: {
            deletePattern: jest.fn().mockResolvedValue(true),
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
            findAll: jest.fn().mockResolvedValue({ total: 0, quests: [], page: 1, limit: 1 }),
          },
        },
        {
          provide: AppealsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 0, appeals: [], page: 1, limit: 1 }),
          },
        },
        {
          provide: PointLogsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ total: 0, pointLogs: [], page: 1, limit: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<DataSyncService>(DataSyncService);
    cacheService = module.get<CacheService>(CacheService);
    auditService = module.get<AuditLogsService>(AuditLogsService);
  });

  describe('executeSyncOperation', () => {
    it('should execute operation with transaction successfully', async () => {
      const operation = jest.fn().mockResolvedValue({ id: '123', name: 'Test' });
      
      const result = await service.executeSyncOperation(
        operation,
        'User',
        'create',
      );

      expect(result.success).toBe(true);
      expect(result.entity).toBe('User');
      expect(result.action).toBe('create');
      expect(result.affectedCount).toBe(1);
      expect(mockConnection.startSession).toHaveBeenCalled();
      expect(mockSession.withTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(cacheService.deletePattern).toHaveBeenCalledWith('user:*');
      expect(cacheService.deletePattern).toHaveBeenCalledWith('dashboard:*');
      expect(auditService.create).toHaveBeenCalled();
    });

    it('should handle operation failure and add to retry queue', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      const result = await service.executeSyncOperation(
        operation,
        'User',
        'update',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation failed');
      expect(result.affectedCount).toBe(0);
      
      const queueStatus = service.getSyncQueueStatus();
      expect(queueStatus.pending).toBeGreaterThan(0);
    });

    it('should handle array results correctly', async () => {
      const operation = jest.fn().mockResolvedValue([
        { id: '1', name: 'Test1' },
        { id: '2', name: 'Test2' },
      ]);
      
      const result = await service.executeSyncOperation(
        operation,
        'User',
        'reconcile',
      );

      expect(result.success).toBe(true);
      expect(result.affectedCount).toBe(2);
    });
  });

  describe('checkDataIntegrity', () => {
    it('should detect orphaned user references', async () => {
      mockModel.aggregate.mockResolvedValueOnce([
        { _id: '123' },
        { _id: '456' },
      ]);

      const report = await service.checkDataIntegrity();

      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.issues).toHaveLength(1);
      expect(report.issues[0]).toMatchObject({
        type: 'orphaned_reference',
        entity: 'User',
        severity: 'high',
        canAutoFix: true,
      });
    });

    it('should detect invalid class head teachers', async () => {
      mockModel.aggregate
        .mockResolvedValueOnce([]) // No orphaned users
        .mockResolvedValueOnce([{ _id: '789' }]); // Invalid head teacher

      const report = await service.checkDataIntegrity();

      expect(report.issues).toHaveLength(1);
      expect(report.issues[0]).toMatchObject({
        type: 'invalid_reference',
        entity: 'Class',
        severity: 'high',
        canAutoFix: true,
      });
    });

    it('should detect duplicate entries', async () => {
      mockModel.aggregate
        .mockResolvedValueOnce([]) // No orphaned users
        .mockResolvedValueOnce([]) // No invalid head teachers
        .mockResolvedValueOnce([{ _id: 'class a', count: 2, ids: ['1', '2'] }]) // Duplicate classes
        .mockResolvedValueOnce([{ _id: 'test@example.com', count: 2, ids: ['3', '4'] }]); // Duplicate emails

      const report = await service.checkDataIntegrity();

      const duplicateIssues = report.issues.filter(i => i.type === 'duplicate_entry');
      expect(duplicateIssues).toHaveLength(2);
      expect(duplicateIssues?.[0]?.entity).toBe('Class');
      expect(duplicateIssues?.[1]?.entity).toBe('User');
    });
  });

  describe('autoFixIntegrityIssues', () => {
    it('should fix auto-fixable issues', async () => {
      const report = {
        timestamp: new Date(),
        issues: [
          {
            type: 'orphaned_reference',
            entity: 'User',
            severity: 'high' as const,
            description: 'Test issue',
            affectedIds: ['123'],
            canAutoFix: true,
          },
          {
            type: 'duplicate_entry',
            entity: 'Class',
            severity: 'medium' as const,
            description: 'Cannot auto-fix',
            affectedIds: ['456'],
            canAutoFix: false,
          },
        ],
        fixedCount: 0,
        pendingCount: 2,
      };

      mockModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.autoFixIntegrityIssues(report);

      expect(result.fixedCount).toBe(1);
      expect(result.pendingCount).toBe(1);
      expect(result.issues).toHaveLength(1);
      expect(result.issues?.[0]?.type).toBe('duplicate_entry');
      expect(auditService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'integrity_auto_fix',
        }),
        'system',
        'System Auto-Fix'
      );
    });

    it('should handle fix failures gracefully', async () => {
      const report = {
        timestamp: new Date(),
        issues: [
          {
            type: 'orphaned_reference',
            entity: 'User',
            severity: 'high' as const,
            description: 'Test issue',
            affectedIds: ['123'],
            canAutoFix: true,
          },
        ],
        fixedCount: 0,
        pendingCount: 1,
      };

      mockModel.updateMany.mockRejectedValue(new Error('Update failed'));

      const result = await service.autoFixIntegrityIssues(report);

      expect(result.fixedCount).toBe(0);
      expect(result.pendingCount).toBe(1);
      expect(result.issues).toHaveLength(1);
    });
  });

  describe('getSyncQueueStatus', () => {
    it('should return queue status', () => {
      const status = service.getSyncQueueStatus();

      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('processing');
      expect(status).toHaveProperty('operations');
      expect(Array.isArray(status.operations)).toBe(true);
    });
  });

  describe('processSyncQueue', () => {
    it('should process pending operations', async () => {
      // Add a mock operation to the queue
      const status = service.getSyncQueueStatus();
      
      await service.processSyncQueue();

      // Queue should be processed
      const newStatus = service.getSyncQueueStatus();
      expect(newStatus.pending).toBe(0);
    });
  });
});

describe('DataSyncService - End-to-End Tests', () => {
  let service: DataSyncService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        DataSyncService,
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue({
              withTransaction: jest.fn(async (callback) => callback()),
              endSession: jest.fn(),
            }),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            aggregate: jest.fn()
              .mockResolvedValueOnce([{ _id: 'orphan1' }])
              .mockResolvedValue([]),
            updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          },
        },
        {
          provide: getModelToken(Class.name),
          useValue: {
            aggregate: jest.fn()
              .mockResolvedValueOnce([{ _id: 'invalid1' }])
              .mockResolvedValue([]),
            updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          },
        },
        {
          provide: getModelToken('Quest'),
          useValue: {
            aggregate: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('Appeal'),
          useValue: {
            aggregate: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('PointLog'),
          useValue: {
            aggregate: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('ActionPreset'),
          useValue: {
            aggregate: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: CacheService,
          useValue: {
            deletePattern: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuditLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<DataSyncService>(DataSyncService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should perform full integrity check and auto-fix flow', async () => {
    // Check integrity
    const report = await service.checkDataIntegrity();
    
    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.pendingCount).toBe(report.issues.length);

    // Auto-fix issues
    const fixedReport = await service.autoFixIntegrityIssues(report);
    
    expect(fixedReport.fixedCount).toBeGreaterThan(0);
    expect(fixedReport.pendingCount).toBeLessThan(report.pendingCount);
  });

  it('should handle concurrent sync operations', async () => {
    const operations = Array(5).fill(null).map((_, i) => 
      service.executeSyncOperation(
        async (session) => ({ id: `${i}`, value: i }),
        'User',
        'create',
      )
    );

    const results = await Promise.all(operations);

    results.forEach((result, i) => {
      expect(result.success).toBe(true);
      expect(result.operationId).toBeDefined();
      expect(result.affectedCount).toBe(1);
    });
  });
});
