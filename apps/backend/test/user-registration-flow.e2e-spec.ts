import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { User, UserSchema } from '../src/database/schemas/user.schema';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import * as bcrypt from 'bcrypt';

// Jest type extensions
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveLength(length: number): R;
    }
  }
}

describe('User Registration Flow (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authService: AuthService;
  let usersService: UsersService;
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
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

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);

    // Create admin user for testing
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    adminUser = await usersService.create({
      nisn: 'ADMIN001',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      roles: ['admin'],
      profile: {
        phone: '+1234567890'
      }
    });

    // Get admin token for authenticated requests
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        nisn: 'ADMIN001',
        password: 'Admin123!'
      });
    
    adminToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    // Clean up test data between tests
    const userModel = app.get('UserModel');
    await userModel.deleteMany({ nisn: { $ne: 'ADMIN001' } }); // Keep admin user
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('1. User Registration Data Persistence', () => {
    it('should successfully create and persist all user data', async () => {
      const userData = {
        nisn: '1234567890',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['student'],
        profile: {
          phone: '+1987654321',
          dateOfBirth: '2000-01-01',
          gender: 'male'
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: {
            marketing: false,
            security: true,
            productUpdates: true,
            weeklyDigest: false
          }
        }
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      // Verify user was created with all data
      expect(response.body).toHaveProperty('_id');
      expect(response.body.nisn).toBe(userData.nisn);
      expect(response.body.firstName).toBe(userData.firstName);
      expect(response.body.lastName).toBe(userData.lastName);
      expect(response.body.roles).toEqual(userData.roles);
      expect(response.body.profile.phone).toBe(userData.profile.phone);
      expect(response.body.preferences.theme).toBe(userData.preferences.theme);
      
      // Verify password is not returned
      expect(response.body).not.toHaveProperty('password');

      // Verify user exists in database
      const createdUser = await usersService.findOne(response.body._id);
      expect(createdUser).toBeDefined();
      expect(createdUser.nisn).toBe(userData.nisn);
    });

    it('should grant initial points to new students', async () => {
      const studentData = {
        nisn: '9876543210',
        password: 'StudentPass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        roles: ['student'],
        profile: {
          phone: '+1234567890'
        }
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      // Verify student received initial points
      const pointsResponse = await request(app.getHttpServer())
        .get(`/point-logs?studentId=${response.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(pointsResponse.body.data).toHaveLength(1);
      expect(pointsResponse.body.data[0].points).toBe(100);
      expect(pointsResponse.body.data[0].category).toBe('Initial Setup');
    });
  });

  describe('2. Data Validation Before Submission', () => {
    it('should reject invalid NISN format', async () => {
      const invalidData = {
        nisn: '123', // Too short
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        roles: ['student']
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should reject weak passwords', async () => {
      const invalidData = {
        nisn: '1111111111',
        password: '123', // Too weak
        firstName: 'Test',
        lastName: 'User',
        roles: ['student']
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        nisn: '2222222222',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        roles: ['student'],
        profile: {
          phone: 'invalid-phone-format' // Invalid format
        }
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should reject invalid roles', async () => {
      const invalidData = {
        nisn: '3333333333',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        roles: ['invalid_role'] // Invalid role
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('3. Success/Error Messages', () => {
    it('should return success message on successful creation', async () => {
      const userData = {
        nisn: '4444444444',
        password: 'TestPass123!',
        firstName: 'Success',
        lastName: 'Test',
        roles: ['student']
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.firstName).toBe('Success');
    });

    it('should return appropriate error for missing required fields', async () => {
      const incompleteData = {
        nisn: '5555555555',
        // Missing password, firstName, lastName, roles
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const userData = {
        nisn: '6666666666',
        password: 'TestPass123!',
        firstName: 'Unauth',
        lastName: 'Test',
        roles: ['student']
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(401);
    });

    it('should return 403 for non-admin users', async () => {
      // Create a regular user
      const regularUser = await usersService.create({
        nisn: '7777777777',
        password: 'RegularPass123!',
        firstName: 'Regular',
        lastName: 'User',
        roles: ['student']
      });

      // Get token for regular user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: '7777777777',
          password: 'RegularPass123!'
        });

      const regularToken = loginResponse.body.accessToken;

      const userData = {
        nisn: '8888888888',
        password: 'TestPass123!',
        firstName: 'Forbidden',
        lastName: 'Test',
        roles: ['student']
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(userData)
        .expect(403);
    });
  });

  describe('4. Duplicate Registration Handling', () => {
    it('should reject duplicate NISN', async () => {
      const userData = {
        nisn: '9999999999',
        password: 'TestPass123!',
        firstName: 'First',
        lastName: 'User',
        roles: ['student']
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const duplicateData = {
        ...userData,
        firstName: 'Duplicate',
        lastName: 'User'
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateData)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('should reject duplicate email', async () => {
      const userData1 = {
        nisn: '1010101010',
        password: 'TestPass123!',
        firstName: 'First',
        lastName: 'User',
        roles: ['student'],
        profile: {
          phone: '+1111111111'
        }
      };

      const userData2 = {
        nisn: '2020202020',
        password: 'TestPass123!',
        firstName: 'Second',
        lastName: 'User',
        roles: ['student'],
        profile: {
          phone: '+1111111111' // Same phone
        }
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData1)
        .expect(201);

      // Try to create user with duplicate email
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData2)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('5. Login Functionality with New Users', () => {
    it('should allow newly created users to login', async () => {
      const userData = {
        nisn: '1212121212',
        password: 'LoginTest123!',
        firstName: 'Login',
        lastName: 'Test',
        roles: ['student']
      };

      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      // Test login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: userData.nisn,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user.nisn).toBe(userData.nisn);
      expect(loginResponse.body.user.firstName).toBe(userData.firstName);
    });

    it('should reject login with wrong password', async () => {
      const userData = {
        nisn: '1313131313',
        password: 'CorrectPass123!',
        firstName: 'Wrong',
        lastName: 'Password',
        roles: ['student']
      };

      // Create user
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      // Test login with wrong password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: userData.nisn,
          password: 'WrongPassword123!'
        })
        .expect(401);
    });

    it('should reject login for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          nisn: '9999999998', // Non-existent NISN
          password: 'AnyPassword123!'
        })
        .expect(401);
    });
  });

  describe('6. Bulk User Creation', () => {
    it('should create multiple users in bulk', async () => {
      const bulkData = {
        users: [
          {
            nisn: '1414141414',
            password: 'BulkTest123!',
            firstName: 'Bulk1',
            lastName: 'User',
            roles: ['student']
          },
          {
            nisn: '1515151515',
            password: 'BulkTest123!',
            firstName: 'Bulk2',
            lastName: 'User',
            roles: ['student']
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bulkData)
        .expect(201);

      expect(response.body).toHaveProperty('created');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.created).toHaveLength(2);
      expect(response.body.errors).toHaveLength(0);
    });

    it('should handle partial failures in bulk creation', async () => {
      const bulkData = {
        users: [
          {
            nisn: '1616161616',
            password: 'BulkTest123!',
            firstName: 'Valid',
            lastName: 'User',
            roles: ['student']
          },
          {
            nisn: '123', // Invalid NISN
            password: 'BulkTest123!',
            firstName: 'Invalid',
            lastName: 'User',
            roles: ['student']
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bulkData)
        .expect(201);

      expect(response.body.created).toHaveLength(1);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0]).toHaveProperty('nisn', '123');
    });
  });
});