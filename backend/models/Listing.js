const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  details: { type: String, required: true }
});

const listingSchema = new mongoose.Schema({
  animalType: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  healthStatus: { 
    type: String, 
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor']
  },
  vaccinationStatus: {
    type: String,
    required: true,
    enum: ['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated', 'Unknown']
  },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  features: [{ type: String }],
  healthRecords: [healthRecordSchema],
  images: [{ type: String, required: true }],
  owner: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  views: { type: Number, default: 0 },
  inquiries: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);