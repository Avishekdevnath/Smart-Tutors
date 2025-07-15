const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.');
  console.error('');
  console.error('Please create a .env.local file in the project root with the following content:');
  console.error('');
      console.error('MONGODB_URI=mongodb://localhost:27017/smart');
  console.error('JWT_SECRET=your-secret-key-change-in-production');
  console.error('');
  console.error('Or set the environment variable directly:');
      console.error('set MONGODB_URI=mongodb://localhost:27017/smart');
  console.error('');
  console.error('If you\'re using MongoDB Atlas, use your connection string instead.');
  process.exit(1);
}

async function createAdmin() {
  try {
    // Connect to MongoDB using mongoose
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('Connected to MongoDB');
    
    // Import the Admin model
    const Admin = require('../src/models/Admin').default;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@smarttutors.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Create admin user
    const adminUser = new Admin({
      username: 'admin',
      email: 'admin@smarttutors.com',
      password: 'admin123', // Will be hashed by the model's pre-save hook
      name: 'System Administrator',
      role: 'super_admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@smarttutors.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin(); 