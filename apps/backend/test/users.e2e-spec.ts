import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppModule } from '../src/app.module';
import { User, UserSchema } from '../src/database/schemas/user.schema';
import { CreateUserDto } from '../src/modules/users/dto';

// Jest type extensions
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveProperty(property: string, value?: any): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      not: Matchers<R>;
    }
    interface Expect {
      arrayContaining(expected: any[]): any;
      stringContaining(expected: string): any;
    }
  }
}

describe('Users (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async (): Promise<void> => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async (): Promise<void> => {
    await app.close();
    await mongoServer.stop();
  });

  describe('/users (POST)', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['student'],
    };

    it('should create a new user with valid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(validUserData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('_id');
          expect(res.body.data.email).toBe(validUserData.email);
          expect(res.body.data.firstName).toBe(validUserData.firstName);
          expect(res.body.data.lastName).toBe(validUserData.lastName);
          expect(res.body.data).not.toHaveProperty('password'); // Password should be excluded
        });
    });

    it('should create user with minimal required fields (nisn and password only)', () => {
      const uniqueNisn = `${Date.now()}1234567890`.slice(-10);
      return request(app.getHttpServer())
        .post('/users')
        .send({
          nisn: uniqueNisn,
          password: 'anypassword',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('_id');
          expect(res.body.data.nisn).toBe(uniqueNisn);
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject user creation with invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          email: 'invalid-email',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.validationErrors).toContain('Please provide a valid email address');
        });
    });

    it('should accept user creation with simple password', () => {
      const uniqueEmail = `simple-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          email: uniqueEmail,
          password: 'simple',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('_id');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject user creation with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          // Missing password (firstName and lastName are now optional)
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.validationErrors).toEqual(
            expect.arrayContaining([
              expect.stringContaining('Password is required'),
            ])
          );
        });
    });

    it('should reject user creation with invalid role', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          roles: ['invalid-role'],
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });

    it('should create user with valid profile data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          email: 'profile-test@example.com',
          profile: {
            bio: 'Test user biography',
            phone: '+1234567890',
            gender: 'male',
            dateOfBirth: '1990-01-01',
            address: {
              street: '123 Main St',
              city: 'Test City',
              state: 'Test State',
              zipCode: '12345',
              country: 'Test Country',
            },
            socialLinks: {
              website: 'https://example.com',
              linkedin: 'https://linkedin.com/in/test',
              twitter: 'https://twitter.com/test',
              github: 'https://github.com/test',
            },
          },
          preferences: {
            theme: 'dark',
            language: 'en',
            timezone: 'UTC',
            emailNotifications: {
              marketing: false,
              security: true,
              productUpdates: true,
              weeklyDigest: false,
            },
            pushNotifications: {
              enabled: true,
              sound: true,
              vibration: false,
            },
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.profile).toBeDefined();
          expect(res.body.data.preferences).toBeDefined();
        });
    });

    it('should reject user creation with invalid URL in social links', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          email: 'invalid-url@example.com',
          profile: {
            socialLinks: {
              website: 'not-a-valid-url',
            },
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });

    it('should reject duplicate email addresses', async () => {
      // First, create a user
      await request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          email: 'duplicate@example.com',
        })
        .expect(201);

      // Then try to create another user with the same email
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...validUserData,
          email: 'duplicate@example.com',
          firstName: 'Different',
          lastName: 'User',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.error).toBe('Conflict');
          expect(res.body.message).toContain('User with this email already exists');
        });
    });
  });

  describe('/users (GET)', () => {
    beforeAll(async (): Promise<void> => {
      // Create some test users for pagination tests
      const testUsers = [
        {
          email: 'user1@example.com',
          password: 'StrongPassword123!',
          firstName: 'Alice',
          lastName: 'Johnson',
          roles: ['student'],
        },
        {
          email: 'user2@example.com',
          password: 'StrongPassword123!',
          firstName: 'Bob',
          lastName: 'Smith',
          roles: ['admin'],
        },
        {
          email: 'user3@example.com',
          password: 'StrongPassword123!',
          firstName: 'Charlie',
          lastName: 'Brown',
          roles: ['user'],
        },
      ];

      for (const user of testUsers) {
        await request(app.getHttpServer())
          .post('/users')
          .send(user);
      }
    });

    it('should return paginated users with default parameters', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('users');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('limit');
          expect(Array.isArray(res.body.data.users)).toBe(true);
          expect(res.body.data.page).toBe(1);
          expect(res.body.data.limit).toBe(10);
        });
    });

    it('should filter users by search term', () => {
      return request(app.getHttpServer())
        .get('/users?search=Alice')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.users.length).toBeGreaterThan(0);
          expect(res.body.data.users[0].firstName).toContain('Alice');
        });
    });

    it('should filter users by role', () => {
      return request(app.getHttpServer())
        .get('/users?role=admin')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.users.length).toBeGreaterThan(0);
          expect(res.body.data.users[0].roles).toContain('admin');
        });
    });

    it('should apply pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.users.length).toBeLessThanOrEqual(2);
          expect(res.body.data.page).toBe(1);
          expect(res.body.data.limit).toBe(2);
        });
    });

    it('should reject invalid query parameters', () => {
      return request(app.getHttpServer())
        .get('/users?page=invalid')
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    let userId: string;

    beforeAll(async (): Promise<void> => {
      // Create a test user
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'getuser@example.com',
          password: 'StrongPassword123!',
          firstName: 'Get',
          lastName: 'User',
          roles: ['student'],
        })
        .expect(201);
      userId = response.body.data._id;
    });

    it('should return user by valid ID', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data._id).toBe(userId);
          expect(res.body.data.email).toBe('getuser@example.com');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.message).toContain('Invalid user ID format');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011') // Valid ObjectId format but non-existent
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('Not Found');
          expect(res.body.message).toBe('User not found');
        });
    });
  });

  describe('/users/:id (PATCH)', () => {
    let userId: string;

    beforeAll(async (): Promise<void> => {
      // Create a test user
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'updateuser@example.com',
          password: 'StrongPassword123!',
          firstName: 'Update',
          lastName: 'User',
          roles: ['student'],
        })
        .expect(201);
      userId = response.body.data._id;
    });

    it('should update user with valid data', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          firstName: 'UpdatedName',
          lastName: 'UpdatedLastName',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.firstName).toBe('UpdatedName');
          expect(res.body.data.lastName).toBe('UpdatedLastName');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject update with invalid email format', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          email: 'invalid-email-format',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .patch('/users/invalid-id')
        .send({ firstName: 'Test' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    let userId: string;

    beforeAll(async (): Promise<void> => {
      // Create a test user
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'deleteuser@example.com',
          password: 'StrongPassword123!',
          firstName: 'Delete',
          lastName: 'User',
          roles: ['student'],
        })
        .expect(201);
      userId = response.body.data._id;
    });

    it('should delete user successfully', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .delete('/users/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/507f1f77bcf86cd799439011') // Valid ObjectId format but non-existent
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('Not Found');
        });
    });
  });
});