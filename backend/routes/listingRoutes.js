// backend/routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');



// Image upload route
router.post('/upload',
  authMiddleware,
  uploadMiddleware.array('images', 5),
  listingController.uploadImages
);

// Create listing route
router.post('/',
  authMiddleware,
  listingController.createListing
);
// Get all listings route
// GET listings with filters
router.get('/', listingController.getListings);

// Add this route to get a single listing
// In your listingRoutes.js
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'username email contact location')
      .lean();

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Transform image URLs
    listing.images = listing.images.map(img => ({
      ...img,
      url: `${process.env.BASE_URL || 'http://localhost:5000'}${img.url}`
    }));

    res.json(listing);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});







module.exports = router;