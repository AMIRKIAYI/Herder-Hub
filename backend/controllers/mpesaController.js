const axios = require('axios');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');

// Generate access token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64');
    
    const url = process.env.NODE_ENV === 'production' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 30000
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
};

// Initiate STK Push
// Initiate STK Push
exports.initiateSTKPush = async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;
    
    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required'
      });
    }

    const accessToken = await getAccessToken();
    
    // Format timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    
    // Generate password
    const password = Buffer.from(
      `${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${timestamp}`
    ).toString('base64');
    
    // Format phone number (2547...)
    let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Validate phone number format
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX)'
      });
    }

    const callbackURL = process.env.NODE_ENV === 'production'
      ? process.env.DARAJA_CALLBACK_URL
      : 'https://your-domain.com/api/mpesa/callback';

    // Make request to Daraja
    const response = await axios.post(
      process.env.NODE_ENV === 'production'
        ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.DARAJA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.DARAJA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Extract the CheckoutRequestID from the response
    const checkoutRequestId = response.data.CheckoutRequestID;
    const merchantRequestId = response.data.MerchantRequestID;

    console.log('STK Push initiated successfully. CheckoutRequestID:', checkoutRequestId);

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        ...response.data,
        checkoutRequestId, // Include this in the response
        merchantRequestId  // Include this too
      }
    });
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to initiate payment';
    if (error.response?.data) {
      errorMessage = error.response.data.errorMessage || errorMessage;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message
    });
  }
};

// Handle M-Pesa callback
// In your mpesaController.js handleCallback function
// Handle M-Pesa callback
exports.handleCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('=== MPESA CALLBACK RECEIVED ===');
    
    if (callbackData.Body && callbackData.Body.stkCallback) {
      const stkCallback = callbackData.Body.stkCallback;
      console.log('ResultCode:', stkCallback.ResultCode);
      console.log('ResultDesc:', stkCallback.ResultDesc);
      console.log('MerchantRequestID:', stkCallback.MerchantRequestID);
      console.log('CheckoutRequestID:', stkCallback.CheckoutRequestID);
      
      // Try to find transaction by MerchantRequestID first
      let transaction = await Transaction.findOne({
        merchantRequestId: stkCallback.MerchantRequestID
      });
      
      // If not found, try CheckoutRequestID
      if (!transaction) {
        transaction = await Transaction.findOne({
          checkoutRequestId: stkCallback.CheckoutRequestID
        });
      }
      
      // If still not found, try to find by other means (like phone number + amount)
      if (!transaction) {
        console.log('Transaction not found by MerchantRequestID or CheckoutRequestID');
        
        // You might want to add additional logic here to find the transaction
        // For example, by phone number and amount if you have that info in the callback
        if (stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) {
          const metadata = stkCallback.CallbackMetadata.Item;
          const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;
          const amount = metadata.find(item => item.Name === 'Amount')?.Value;
          
          if (phoneNumber && amount) {
            transaction = await Transaction.findOne({
              phoneNumber: phoneNumber.toString(),
              amount: amount,
              status: 'pending'
            });
            
            if (transaction) {
              console.log('Transaction found by phone number and amount:', transaction._id);
              // Update with the request IDs for future reference
              transaction.merchantRequestId = stkCallback.MerchantRequestID;
              transaction.checkoutRequestId = stkCallback.CheckoutRequestID;
            }
          }
        }
      }
      
      if (transaction) {
        console.log('Transaction found:', transaction._id);
        
        if (stkCallback.ResultCode === 0) {
          // Payment was successful
          console.log('Payment successful!');
          const metadata = stkCallback.CallbackMetadata.Item;
          const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
          const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
          
          // Update transaction
          transaction.status = 'completed';
          transaction.mpesaReceiptNumber = mpesaReceiptNumber;
          transaction.resultCode = stkCallback.ResultCode;
          transaction.resultDesc = stkCallback.ResultDesc;
          await transaction.save();
          
          console.log(`Transaction ${transaction._id} completed successfully`);
          
          // Mark listing as sold
          try {
            const Listing = mongoose.model('Listing');
            await Listing.findByIdAndUpdate(transaction.listingId, {
              status: 'sold'
            });
            console.log('Listing marked as sold:', transaction.listingId);
          } catch (error) {
            console.error('Error marking listing as sold:', error);
          }
        } else {
          // Payment failed
          console.log('Payment failed:', stkCallback.ResultDesc);
          transaction.status = 'failed';
          transaction.resultCode = stkCallback.ResultCode;
          transaction.resultDesc = stkCallback.ResultDesc;
          await transaction.save();
          
          console.log(`Transaction ${transaction._id} marked as failed`);
        }
      } else {
        console.log('Transaction not found for callback. MerchantRequestID:', stkCallback.MerchantRequestID, 'CheckoutRequestID:', stkCallback.CheckoutRequestID);
        
        // You might want to create a new transaction record here if needed
        // or log this for investigation
      }
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
};

// Check transaction status

exports.checkTransactionStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params; // Make sure this matches the route parameter
    
    console.log('Checking status for checkoutRequestID:', checkoutRequestID);
    
    const transaction = await Transaction.findOne({ checkoutRequestID });
    
    if (!transaction) {
      console.log('Transaction not found for ID:', checkoutRequestID);
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    console.log('Transaction found:', transaction.status);
    
    res.json({
      success: true,
      transaction: {
        _id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        phoneNumber: transaction.phoneNumber,
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        failureReason: transaction.failureReason,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking transaction status',
      error: error.message
    });
  }
};