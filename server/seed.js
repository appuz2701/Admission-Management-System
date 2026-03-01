const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['admin', 'admission_officer', 'management'], default: 'admission_officer' },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false, // Make it optional for admin
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/admission_mgmt';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@college.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@college.com');
      console.log('🔑 Password: admin123');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user (without institution - admin can work across all institutions)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@college.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      institution: null, // Admin doesn't need an institution
    });

    await adminUser.save();
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Email: admin@college.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();