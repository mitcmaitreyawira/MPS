import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestUser, createTestAdmin } from './setup';
import { ValidationPipe } from '@nestjs/common';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let testUser: any;
  let testAdmin: any;

  beforeAll(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
    
    testUser = createTestUser();
    testAdmin = createTestAdmin();
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should reject login with invalid credentials', async (): Promise<void> => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: '9999999999',
          password: 'wrongpassword',
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('should reject login with missing nisn', async (): Promise<void> => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('validationErrors');
      expect(response.body.statusCode).toBe(400);
    });

    it('should reject login with invalid nisn format', async (): Promise<void> => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: 'invalid-nisn',
          password: 'password123',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('validationErrors');
      expect(response.body.statusCode).toBe(400);
    });

    it('should accept simple passwords (validation simplified)', async (): Promise<void> => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: '9999999999',
          password: '123',
        })
        .expect(401); // Unauthorized because user doesn't exist, not validation error
      
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', async (): Promise<void> => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message', 'Logged out');
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should reject access without token', async (): Promise<void> => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });
});