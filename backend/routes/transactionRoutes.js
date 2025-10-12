// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  getUserTransactions
} = require('../controllers/transactionController');

// CHANGE THIS LINE:
const protect = require('../middleware/auth'); // Remove the destructuring


// POST /api/transactions
router.post('/', protect, createTransaction);

// GET /api/transactions
router.get('/', protect, getTransactions);

// GET /api/transactions/user
router.get('/user', protect, getUserTransactions);

// GET /api/transactions/:id
router.get('/:id', protect, getTransaction);

// PATCH /api/transactions/:id
router.patch('/:id', protect, updateTransaction);

module.exports = router;