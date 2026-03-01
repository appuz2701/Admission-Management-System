const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campus name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Campus code is required'],
    uppercase: true,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  },
  address: String,
  city: String,
  state: String,
  pincode: String,
  contactPerson: String,
  contactPhone: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

campusSchema.index({ institution: 1, code: 1 });

module.exports = mongoose.model('Campus', campusSchema);