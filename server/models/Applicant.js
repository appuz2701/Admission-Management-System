const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^\d{10}$/, 'Phone must be 10 digits'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  category: {
    type: String,
    enum: ['GM', 'SC', 'ST', 'OBC'],
    required: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
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
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true,
  },
  quotaType: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: true,
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: 0,
  },
  rank: String,
  status: {
    type: String,
    enum: ['Applied', 'Allotted', 'Admitted', 'Rejected', 'Withdrawn'],
    default: 'Applied',
  },
  documentStatus: {
    type: String,
    enum: ['Pending', 'Submitted', 'Verified'],
    default: 'Pending',
  },
  documents: [
    {
      name: String,
      type: String,
      url: String,
      uploadedAt: Date,
      status: {
        type: String,
        enum: ['Pending', 'Submitted', 'Verified'],
        default: 'Pending',
      },
      remarks: String,
    },
  ],
  feeStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  feeAmount: Number,
  feePaidDate: Date,
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  admissionConfirmedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

applicantSchema.index({ email: 1, program: 1 });
applicantSchema.index({ institution: 1, status: 1 });

module.exports = mongoose.model('Applicant', applicantSchema);