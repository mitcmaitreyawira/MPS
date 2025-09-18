const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function createDemoUsers() {
  const client = new MongoClient('mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mps_db_unified');
    const usersCollection = db.collection('users');
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ nisn: 'ADMIN001' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const adminPassword = await bcrypt.hash('Admin123!', 12);
      await usersCollection.insertOne({
        nisn: 'ADMIN001',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin'],
        profile: {
          phone: '+1234567890'
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
        },
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Admin user created: ADMIN001');
    }
    
    // Check if teacher user already exists
    const existingTeacher = await usersCollection.findOne({ nisn: 'TEACH001' });
    if (existingTeacher) {
      console.log('Teacher user already exists');
    } else {
      // Create teacher user
      const teacherPassword = await bcrypt.hash('Teacher123!', 12);
      await usersCollection.insertOne({
        nisn: 'TEACH001',
        password: teacherPassword,
        firstName: 'Teacher',
        lastName: 'Demo',
        roles: ['teacher'],
        profile: {
          phone: '+1234567891'
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
        },
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Teacher user created: TEACH001');
    }
    
    // Check if student user already exists
    const existingStudent = await usersCollection.findOne({ nisn: '1001234567' });
    if (existingStudent) {
      console.log('Student user already exists');
    } else {
      // Create student user
      const studentPassword = await bcrypt.hash('Student123!', 12);
      await usersCollection.insertOne({
        nisn: '1001234567',
        password: studentPassword,
        firstName: 'Student',
        lastName: 'Demo',
        roles: ['student'],
        profile: {
          phone: '+1234567892'
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
        },
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Student user created: 1001234567');
    }
    
    console.log('\n🎉 Demo users setup complete!');
    console.log('You can now login with:');
    console.log('- Admin: ADMIN001 / Admin123!');
    console.log('- Teacher: TEACH001 / Teacher123!');
    console.log('- Student: 1001234567 / Student123!');
    
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await client.close();
  }
}

createDemoUsers();