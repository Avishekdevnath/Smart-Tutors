const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Replace this with your MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://avishekdevnath:vj4xRYo0QGcSsDXj@phitron.tn7bb.mongodb.net/smart?retryWrites=true&w=majority';

console.log('🔗 Attempting to connect to MongoDB...');
console.log('Using URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
console.log('');

async function createAdmin() {
  try {
    // Connect to MongoDB using mongoose
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('✅ Connected to MongoDB successfully');
    
    // Define Admin schema inline
    const adminSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
      isActive: { type: Boolean, default: true },
      lastLogin: Date,
      loginAttempts: { type: Number, default: 0 },
      lockUntil: Date
    }, { timestamps: true });

    // Hash password before saving
    adminSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      
      try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
    });

    const Admin = mongoose.model('Admin', adminSchema);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@smarttutors.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username: admin');
      console.log('Email: admin@smarttutors.com');
      return;
    }
    
    // Create admin user
    const adminUser = new Admin({
      username: 'admin',
      email: 'admin@smarttutors.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'super_admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('Username: admin');
    console.log('Email: admin@smarttutors.com');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('🔧 MongoDB Connection Issues:');
      console.error('1. Make sure MongoDB is running locally, OR');
      console.error('2. Use MongoDB Atlas (cloud database)');
      console.error('3. Update the MONGODB_URI in this script');
      console.error('');
      console.error('📝 To use MongoDB Atlas:');
      console.error('1. Go to mongodb.com/atlas');
      console.error('2. Create a free account and cluster');
      console.error('3. Get your connection string');
      console.error('4. Replace the MONGODB_URI in this script');
    } else if (error.message.includes('Authentication failed')) {
      console.error('');
      console.error('🔐 Authentication Error:');
      console.error('Check your username and password in the connection string');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin(); 