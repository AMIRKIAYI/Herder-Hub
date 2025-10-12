const express = require('express');
const router = express.Router();
const { initiateSTKPush, handleCallback, checkTransactionStatus } = require('../controllers/mpesaController');
const protect = require('../middleware/auth');

// Initiate STK Push payment
router.post('/stkpush', protect, initiateSTKPush);

// Handle M-Pesa callback
router.post('/callback', handleCallback);

// Check transaction status - fix the parameter name to match what frontend expects
router.get('/transaction-status/:checkoutRequestID', protect, checkTransactionStatus);

// Add to your mpesaRoutes.js
router.post('/b2c', async (req, res) => {
  try {
    const { phoneNumber, amount, transactionId } = req.body;
    
    // Get seller details from transaction
    const transaction = await Transaction.findById(transactionId).populate('sellerId');
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const sellerPhone = transaction.sellerId.phone; // Assuming seller has phone field
    
    // MPESA B2C API call to send money to seller
    const auth = "Bearer " + access_token; // You need to get this token
    const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
    
    const data = {
      "InitiatorName": process.env.MPESA_INITIATOR_NAME,
      "SecurityCredential": process.env.MPESA_SECURITY_CREDENTIAL,
      "CommandID": "BusinessPayment",
      "Amount": amount,
      "PartyA": process.env.MPESA_SHORTCODE,
      "PartyB": sellerPhone,
      "Remarks": `Payment for livestock sale - Transaction ${transactionId}`,
      "QueueTimeOutURL": `${process.env.BASE_URL}/api/mpesa/b2c-timeout`,
      "ResultURL": `${process.env.BASE_URL}/api/mpesa/b2c-result`,
      "Occasion": "Livestock sale"
    };
    
    const response = await axios.post(url, data, {
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      }
    });
    
    // Update transaction with disbursement details
    await Transaction.findByIdAndUpdate(transactionId, {
      sellerDisbursementId: response.data.ConversationID,
      sellerDisbursementStatus: 'pending'
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('B2C Error:', error);
    res.status(500).json({ error: 'Failed to process disbursement' });
  }
});

module.exports = router;