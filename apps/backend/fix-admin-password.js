const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function fixAdminPassword() {
  try {
    await mongoose.connect('mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
    
    // Hash the admin password from .env file
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    console.log('Password hashed successfully');
    
    // Update the admin user with NISN ADMIN001
    const result = await User.findOneAndUpdate(
      {nisn: 'ADMIN001'}, 
      {password: adminPassword}, 
      {new: true}
    );
    
    if (result) {
      console.log('Admin password updated successfully for:', result.firstName, result.lastName);
      console.log('NISN:', result.nisn);
    } else {
      console.log('Admin user with NISN ADMIN001 not found');
    }
    
    // Verify the update
    const user = await User.findOne({nisn: 'ADMIN001'}).select('+password');
    console.log('Verification - User has password:', !!user.password);
    
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
  }
}

fixAdminPassword();