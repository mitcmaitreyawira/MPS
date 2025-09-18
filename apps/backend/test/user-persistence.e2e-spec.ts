/// <reference types="jest" />
/// <reference types="@types/jest" />
/* eslint-env jest */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/database/schemas/user.schema';
import { DevLockService } from '../src/common/services/dev-lock.service';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTruthy(): R;
      toBeNull(): R;
      toBeFalsy(): R;
      toBeDefined(): R;
      toBeUndefined(): R;
    }
  }
}

describe('User Persistence Across Restarts (e2e)', () => {
  let app: INestApplication;
  let userModel: any;
  let devLockService: DevLockService;
  let createdUserId: string;
  let moduleFixture: TestingModule;

  const testUserData = {
    nisn: '1234567890',
    password: 'TestPassword123!',
    firstName: 'Persistence',
    lastName: 'Test',
    roles: ['student'],
    profile: {
      phone: '+1234567890'
    }
  };

  beforeAll(async () => {
    // First application instance
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    devLockService = moduleFixture.get(DevLockService);
  });

  afterAll(async () => {
    // Clean up test data
    if (createdUserId) {
      await userModel.findByIdAndDelete(createdUserId);
    }
    await app.close();
  });

  describe('User Persistence Test', () => {
    it('should create a user that persists after simulated restart', async () => {
      // Step 1: Create a user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUserData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data).toHaveProperty('_id');
      createdUserId = createResponse.body.data._id;

      // Verify user was created
      const userInDb = await userModel.findById(createdUserId);
      expect(userInDb).toBeTruthy();
      expect(userInDb.nisn).toBe(testUserData.nisn);
      expect(userInDb.firstName).toBe(testUserData.firstName);
      expect(userInDb.deletedAt).toBeNull();
    });

    it('should find the user after simulated application restart', async () => {
      // Step 2: Simulate application restart by closing and recreating the app
      await app.close();
      
      // Note: DevLockService automatically releases locks on app shutdown

      // Create new application instance (simulating restart)
      const newModuleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const newApp = newModuleFixture.createNestApplication();
      newApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await newApp.init();

      // Step 3: Verify user still exists after restart
      const getUserResponse = await request(newApp.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(getUserResponse.body.success).toBe(true);
      expect(getUserResponse.body.data._id).toBe(createdUserId);
      expect(getUserResponse.body.data.nisn).toBe(testUserData.nisn);
      expect(getUserResponse.body.data.firstName).toBe(testUserData.firstName);
      expect(getUserResponse.body.data.lastName).toBe(testUserData.lastName);
      expect(getUserResponse.body.data).not.toHaveProperty('password');

      // Step 4: Verify user appears in user list
      const getUsersResponse = await request(newApp.getHttpServer())
        .get('/users')
        .expect(200);

      expect(getUsersResponse.body.success).toBe(true);
      const users = getUsersResponse.body.data.users;
      const persistedUser = users.find((user: any) => user._id === createdUserId);
      expect(persistedUser).toBeTruthy();
      expect(persistedUser.nisn).toBe(testUserData.nisn);

      // Clean up the new app instance
      await newApp.close();
    });

    it('should handle soft delete persistence across restarts', async () => {
      // Create new app instance for this test
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const app = moduleFixture.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();

      // Create a test user for soft delete
      const softDeleteUserData = {
        nisn: '9876543210',
        password: 'SoftDeleteTest123!',
        firstName: 'SoftDelete',
        lastName: 'Test',
        roles: ['student']
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(softDeleteUserData)
        .expect(201);

      const softDeleteUserId = createResponse.body.data._id;

      // Soft delete the user
      await request(app.getHttpServer())
        .delete(`/users/${softDeleteUserId}`)
        .expect(200);

      // Verify user is soft deleted (has deletedAt timestamp)
      const deletedUser = await userModel.findById(softDeleteUserId);
      expect(deletedUser).toBeTruthy();
      expect(deletedUser.deletedAt).toBeTruthy();

      // Simulate restart
      await app.close();

      const newModuleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const newApp = newModuleFixture.createNestApplication();
      await newApp.init();

      // Verify soft deleted user is not returned in normal queries
      await request(newApp.getHttpServer())
        .get(`/users/${softDeleteUserId}`)
        .expect(404);

      // But still exists in database with deletedAt timestamp
      const stillDeletedUser = await userModel.findById(softDeleteUserId);
      expect(stillDeletedUser).toBeTruthy();
      expect(stillDeletedUser.deletedAt).toBeTruthy();

      // Clean up
      await userModel.findByIdAndDelete(softDeleteUserId);
      await newApp.close();
    });
  });

  describe('Dev Lock Conflict Prevention', () => {
    it('should prevent dual backend instances from running simultaneously', async () => {
      // This test verifies the dev lock mechanism works
      // The first instance should already have the lock from beforeAll
      
      // Try to create a second application instance
      let secondApp: INestApplication;
      let lockConflictDetected = false;

      try {
        const secondModuleFixture = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        secondApp = secondModuleFixture.createNestApplication();
        await secondApp.init();
        
        // If we get here without error, the lock mechanism might not be working
        // Let's check if both instances can acquire locks
        const secondDevLockService = secondModuleFixture.get(DevLockService);
        
        // The lock mechanism should prevent the second instance from starting
        // If we reach this point, check if the lock is working by trying to start
        lockConflictDetected = false;
        await secondApp.close();
      } catch (error) {
        // Expected behavior - second instance should fail to start
        lockConflictDetected = true;
      }

      expect(lockConflictDetected).toBe(true);
    });
  });
});