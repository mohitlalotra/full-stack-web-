const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    salesRepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    notes: {
      type: String,
      required: [true, 'Notes are required for follow-up'],
    },
    nextFollowUpDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    followUps: [followUpSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
