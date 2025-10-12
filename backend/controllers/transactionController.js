const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');


// Create a new transaction
// Create a new transaction
// Create a new transaction
// In your createTransaction controller
exports.createTransaction = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { listingId, amount, phoneNumber, accountReference, paymentMethod } = req.body;
    
    // Get the listing to find the seller
    const Listing = mongoose.model('Listing');
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    const transaction = await Transaction.create({
      listingId,
      buyerId: req.user.id,
      sellerId: listing.seller,
      amount,
      phoneNumber,
      accountReference,
      paymentMethod: paymentMethod || 'mpesa',
      status: 'pending'
    });
    
    console.log('Transaction created with ID:', transaction._id);
    
    // Return the transaction WITH the _id field
    res.status(201).json({
      success: true,
      transaction: {
        _id: transaction._id, // Make sure this is included
        listingId: transaction.listingId,
        buyerId: transaction.buyerId,
        sellerId: transaction.sellerId,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        phoneNumber: transaction.phoneNumber,
        accountReference: transaction.accountReference,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('listingId', 'animalType breed price')
      .populate('buyerId', 'username email')
      .populate('sellerId', 'username email');
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// Get user's transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { buyerId: req.user.id },
        { sellerId: req.user.id }
      ]
    })
      .populate('listingId', 'animalType breed price images')
      .populate('buyerId', 'username email phoneNumber')
      .populate('sellerId', 'username email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get User Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transactions'
    });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('listingId', 'animalType breed price images location')
      .populate('buyerId', 'username email phoneNumber')
      .populate('sellerId', 'username email phoneNumber');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if user is authorized to view this transaction
    if (transaction.buyerId._id.toString() !== req.user.id && 
        transaction.sellerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
};

// Update transaction
// In your transactionController.js
exports.updateTransaction = async (req, res) => {
  try {
    console.log('Update transaction request:', req.params.id, req.body);
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Allow updates only for certain fields
    const allowedUpdates = ['status', 'mpesaReceiptNumber', 'resultCode', 'resultDesc'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    });
  }
};