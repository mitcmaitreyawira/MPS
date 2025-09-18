import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/database/schemas/user.schema';
import { PasswordManagementService } from '../src/modules/password-management/password-management.service';
import * as bcrypt from 'bcrypt';

describe('Password Management (e2e)', () => {
  let app: INestApplication;
  let userModel: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('Test@1234', 12);
    const user = new userModel({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      roles: ['user'],
    });
    testUser = await user.save();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test@example.com',
        password: 'Test@1234',
      });
    
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  describe('Password Change', () => {
    it('should successfully change password with valid current password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'NewP@ssw0rd123',
        });
      
      if (res.status !== HttpStatus.OK) {
        throw new Error(`Change password failed with status ${res.status}: ${JSON.stringify(res.body)}`);
      }
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should reject password change with invalid current password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewP@ssw0rd123',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body.message).toContain('Current password is incorrect');
    });
  });

  describe('Password Reset', () => {
    it('should generate reset token for valid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({ email: 'test@example.com' })
        .expect(HttpStatus.ACCEPTED);

      expect(res.body).toHaveProperty('success', true);
    });

    it('should reset password with valid token', async () => {
      // Use the service's generateResetToken method which handles everything properly
      const passwordManagementService = app.get(PasswordManagementService);
      
      console.log('=== TEST DEBUG: About to generate reset token ===');
      const resetToken = await passwordManagementService.generateResetToken(testUser._id.toString());
      console.log('=== TEST DEBUG: Reset token generated ===');

      // Debug: Check what was actually stored in the database
      const updatedUser = await userModel.findById(testUser._id).select('+passwordResetToken');
      console.log('=== TEST DEBUG: Database check ===');
      console.log('Generated token:', resetToken);
      console.log('Stored hash:', updatedUser.passwordResetToken);
      console.log('Hash type:', typeof updatedUser.passwordResetToken);
      console.log('Hash length:', updatedUser.passwordResetToken?.length);
      
      // Test bcrypt.compare directly in the test
      const bcrypt = require('bcrypt');
      try {
        const directCompare = await bcrypt.compare(resetToken, updatedUser.passwordResetToken);
        console.log('Direct bcrypt.compare result:', directCompare);
      } catch (directError) {
        console.error('Direct bcrypt.compare error:', directError);
      }
      console.log('=== TEST DEBUG: About to make API call ===');

      // Now try to reset password
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewSecureP@ss123',
        });
      
      console.log('=== TEST DEBUG: API call completed ===');
      
      if (res.status !== HttpStatus.OK) {
        throw new Error(`Password reset failed with status ${res.status}: ${JSON.stringify(res.body)}`);
      }
      expect(res.body).toHaveProperty('success', true);
    });
  });
});
