const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'Academic year is required'],
    // ✅ Removed unique: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  admissionStartDate: Date,
  admissionEndDate: Date,
  isActive: {
    type: Boolean,
    default: false,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
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

academicYearSchema.index({ institution: 1, year: 1 }, { unique: true });  // ✅ Made compound index unique

module.exports = mongoose.model('AcademicYear', academicYearSchema);
