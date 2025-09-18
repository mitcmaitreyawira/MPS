import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';

/**
 * Demo Users Seeding Script
 * 
 * This script creates demo users for testing the application:
 * - Admin user (ADMIN001)
 * - Teacher user (TEACH001) 
 * - Student user (1001234567)
 */

const demoUsers: CreateUserDto[] = [
  {
    nisn: 'ADMIN001',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['admin']
  },
  {
    nisn: 'TEACH001', 
    password: 'Teacher123!',
    firstName: 'John',
    lastName: 'Smith',
    roles: ['teacher']
  },
  {
    nisn: '1001234567',
    password: 'Student123!',
    firstName: 'Alice',
    lastName: 'Wilson', 
    roles: ['student']
  }
];

async function seedDemoUsers() {
  console.log('🚀 Starting demo users seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    console.log('👥 Creating demo users...');
    
    for (const userData of demoUsers) {
      try {
        // Try to create the user
        const user = await usersService.create(userData);
        console.log(`✅ Created user: ${userData.nisn} (${userData.firstName} ${userData.lastName})`);
        
      } catch (error) {
        if (error instanceof Error && error.message?.includes('already exists')) {
          console.log(`⚠️  User ${userData.nisn} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to create user ${userData.nisn}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    console.log('🎉 Demo users seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the seeding
seedDemoUsers();