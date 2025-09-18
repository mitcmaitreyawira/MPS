/// <reference types="jest" />
/* eslint-env jest */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let mongod: MongoMemoryServer;
let app: INestApplication;

beforeAll(async (): Promise<void> => {
  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = uri;
  process.env.JWT_ACCESS_SECRET = 'test-jwt-secret';
  process.env.JWT_ACCESS_EXPIRES_IN = '1h';
  
  // Create test application
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  
  // Apply global configurations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Global filters and interceptors are now registered in AppModule
  
  await app.init();
});

afterAll(async (): Promise<void> => {
  if (app) {
    await app.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

// Export for use in tests
export { app };

// Global test utilities
export const createTestUser = () => ({
  nisn: `${Date.now()}1234567890`.slice(-10),
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  roles: ['user'],
});

export const createTestAdmin = () => ({
  nisn: `${Date.now()}9876543210`.slice(-10),
  password: 'AdminPassword123!',
  firstName: 'Admin',
  lastName: 'User',
  roles: ['admin'],
});