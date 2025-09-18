import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/database/schemas/user.schema';
import { PasswordManagementService } from '../src/modules/password-management/password-management.service';
import * as bcrypt from 'bcrypt';

describe('Database Debug (e2e)', () => {
  let app: INestApplication;
  let userModel: any;
  let passwordManagementService: PasswordManagementService;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    passwordManagementService = app.get(PasswordManagementService);

    // Create a test user
    testUser = await userModel.create({
      email: 'debug@test.com',
      password: 'TempPassword123!',
      firstName: 'Debug',
      lastName: 'User',
      roles: ['student'],
      profile: {},
      preferences: {
        theme: 'light',
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
          vibration: true,
        },
      },
    });
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  it('should debug database storage and retrieval', async () => {
    console.log('=== DATABASE DEBUG TEST START ===');
    
    // Generate reset token
    const resetToken = await passwordManagementService.generateResetToken(testUser._id.toString());
    console.log('Generated reset token:', resetToken);
    
    // Check what's stored in database
    const updatedUser = await userModel.findById(testUser._id).select('+passwordResetToken +passwordResetExpires');
    console.log('Stored passwordResetToken:', updatedUser.passwordResetToken);
    console.log('Token type:', typeof updatedUser.passwordResetToken);
    console.log('Token length:', updatedUser.passwordResetToken?.length);
    console.log('Token starts with $2:', updatedUser.passwordResetToken?.startsWith('$2'));
    
    // Test direct bcrypt operations
    try {
      console.log('Testing bcrypt.compare directly...');
      const result = await bcrypt.compare(resetToken, updatedUser.passwordResetToken);
      console.log('Direct bcrypt.compare result:', result);
    } catch (error) {
      console.error('Direct bcrypt.compare error:', (error as Error).message);
    }
    
    // Test with a fresh hash
    try {
      console.log('Testing with fresh hash...');
      const freshHash = await bcrypt.hash(resetToken, 10);
      console.log('Fresh hash:', freshHash);
      const freshResult = await bcrypt.compare(resetToken, freshHash);
      console.log('Fresh hash compare result:', freshResult);
    } catch (error) {
      console.error('Fresh hash error:', (error as Error).message);
    }
    
    console.log('=== DATABASE DEBUG TEST END ===');
  });
});