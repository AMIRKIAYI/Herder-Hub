// backend/models/Listing.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  animalType: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: String, required: true },
  weight: { type: String, required: true },
  healthStatus: { type: String, required: true },
  vaccinationStatus: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  features: [{ type: String }],
  healthRecords: [{
    date: { type: Date },
    type: { type: String },
    details: { type: String }
  }],
  images: [{
    url: String,
    filename: String
  }],
  
  // Seller information - ADD THESE FIELDS
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerEmail: {
    type: String,
    required: true
  },
  sellerPhone: {
    type: String,
    required: true
  },
  preferredContactMethod: {
    type: String,
    enum: ['call', 'whatsapp'],
    default: 'whatsapp'
  },
  
  rating: { type: Number, default: 4.5 },
  status: { type: String, enum: ['active', 'sold', 'pending'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add text index for search functionality
listingSchema.index({ 
  animalType: 'text', 
  breed: 'text', 
  description: 'text',
  location: 'text'
});

// Update timestamp on save
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Listing', listingSchema);