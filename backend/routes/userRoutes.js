// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update user contact information
router.put('/update-contact', auth, async (req, res) => {
  try {
    const { phone, preferredContact } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (preferredContact !== undefined) updateData.preferredContact = preferredContact;

    // Validate phone number if provided
    if (phone && phone.length < 9) {
      return res.status(400).json({ message: 'Valid phone number is required (at least 9 digits)' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Contact information updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ message: 'Server error updating contact information' });
  }
});

// Add this alias endpoint for backward compatibility
router.put('/update-phone', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    // Validate phone number
    if (!phone || phone.length < 9) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { phone },
      { new: true }
    ).select('-password');

    res.json({ message: 'Phone number updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating phone:', error);
    res.status(500).json({ message: 'Server error updating phone number' });
  }
});

module.exports = router;