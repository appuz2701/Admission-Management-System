const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['KCET', 'COMEDK', 'Management'],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 0,
    },
    filled: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Program code is required'],
    uppercase: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  courseType: {
    type: String,
    enum: ['UG', 'PG'],
    required: true,
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true,
  },
  admissionMode: {
    type: String,
    enum: ['Government', 'Management'],
    required: true,
  },
  totalIntake: {
    type: Number,
    required: [true, 'Total intake is required'],
    min: 1,
  },
  quotas: [quotaSchema],
  supernumerarySeats: {
    total: {
      type: Number,
      default: 0,
    },
    filled: {
      type: Number,
      default: 0,
    },
  },
  totalFilled: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation: Total quota seats must equal intake
programSchema.pre('save', function (next) {
  const totalQuotaSeats = this.quotas.reduce((sum, quota) => sum + quota.seats, 0);
  if (totalQuotaSeats !== this.totalIntake) {
    return next(
      new Error(`Total quota seats (${totalQuotaSeats}) must equal total intake (${this.totalIntake})`)
    );
  }
  this.updatedAt = Date.now();
  next();
});

programSchema.index({ institution: 1, academicYear: 1 });

module.exports = mongoose.model('Program', programSchema);