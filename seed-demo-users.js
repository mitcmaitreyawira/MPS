#!/usr/bin/env node

/**
 * Demo Users Seeding Script
 * 
 * This script creates demo users for testing the application:
 * - Admin user (ADMIN001)
 * - Teacher user (TEACH001) 
 * - Student user (1001234567)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mps_db';

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  nisn: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  roles: [{ type: String, required: true }],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Demo users data
const demoUsers = [
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
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('👥 Creating demo users...');
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ nisn: userData.nisn });
        if (existingUser) {
          console.log(`⚠️  User ${userData.nisn} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create user
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        console.log(`✅ Created user: ${userData.nisn} (${userData.firstName} ${userData.lastName})`);
        
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.nisn}:`, error.message);
      }
    }
    
    console.log('🎉 Demo users seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedDemoUsers();