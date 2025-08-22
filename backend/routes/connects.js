// routes/connects.js
const express = require('express');
const router = express.Router();
const Connect = require('../models/Connect');
const auth = require('../middleware/auth');

// Get user's connects
router.get('/', auth, async (req, res) => {
  try {
    const connects = await Connect.find({ userId: req.user.id })
      .populate('listingId')
      .populate('sellerId');
    res.json(connects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new connect
router.post('/', auth, async (req, res) => {
  try {
    const connect = new Connect({
      userId: req.user.id,
      listingId: req.body.listingId,
      sellerId: req.body.sellerId,
      contactMethod: req.body.contactMethod,
      notes: req.body.notes || '',
      status: req.body.status || 'pending'
    });
    
    const newConnect = await connect.save();
    // Populate the connect with seller and listing info
    await newConnect.populate('sellerId');
    await newConnect.populate('listingId');
    
    res.status(201).json(newConnect);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a connect
router.patch('/:id', auth, async (req, res) => {
  try {
    const connect = await Connect.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!connect) {
      return res.status(404).json({ message: 'Connect not found' });
    }
    
    if (req.body.status) connect.status = req.body.status;
    if (req.body.notes) connect.notes = req.body.notes;
    
    const updatedConnect = await connect.save();
    await updatedConnect.populate('sellerId');
    await updatedConnect.populate('listingId');
    
    res.json(updatedConnect);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a connect
router.delete('/:id', auth, async (req, res) => {
  try {
    const connect = await Connect.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!connect) {
      return res.status(404).json({ message: 'Connect not found' });
    }
    
    await Connect.deleteOne({ _id: req.params.id });
    res.json({ message: 'Connect deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get connect count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Connect.countDocuments({ 
      userId: req.user.id,
      status: 'pending'
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;