// models/Connect.js
const mongoose = require('mongoose');

const connectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactMethod: {
    type: String,
    enum: ['call', 'whatsapp', 'message', 'email'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'completed', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
connectSchema.index({ userId: 1, createdAt: -1 });
connectSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Connect', connectSchema);