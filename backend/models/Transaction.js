const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mpesa', 'cash', 'bank_transfer']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  mpesaReceiptNumber: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true
  },
  // ADD THESE NEW FIELDS:
  checkoutRequestId: {
    type: String,
    sparse: true // Allows null values but still indexes non-null values
  },
  merchantRequestId: {
    type: String,
    sparse: true
  },
  resultCode: {
    type: Number
  },
  resultDesc: {
    type: String
  }
}, {
  timestamps: true
});

// Add sellerId automatically based on listing
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Listing = mongoose.model('Listing');
      const listing = await Listing.findById(this.listingId).populate('seller');
      
      if (listing && listing.seller) {
        this.sellerId = listing.seller._id;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);