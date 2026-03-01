const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['admin', 'admission_officer', 'management'], default: 'admission_officer' },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false,
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

module.exports = async (req, res) => {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@college.com' });
    
    if (existingAdmin) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: 'admin@college.com',
          password: 'admin123'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@college.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      institution: null,
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully!',
      credentials: {
        email: 'admin@college.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
