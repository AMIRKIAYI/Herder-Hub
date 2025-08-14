// backend/controllers/listingController.js
const Listing = require('../models/Listing');
const User = require('../models/User');



exports.getListings = async (req, res) => {
  try {
    const { 
      status = 'active',
      minPrice, 
      maxPrice, 
      animalType, 
      breed, 
      location,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status };

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Animal type filter
    if (animalType) {
      query.animalType = animalType;
    }

    // Breed filter
    if (breed) {
      query.breed = breed;
    }

    // Location filter
    if (location) {
      query.location = location;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('seller', 'username phone email location');

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Server error while fetching listings' });
  }
};

exports.createListing = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const sellerId = req.user.id;
    
    // Create new listing
    const listing = new Listing({
      ...req.body,
      seller: sellerId
    });

    // Save listing
    await listing.save();

    // Add listing to user's listings array
    await User.findByIdAndUpdate(
      sellerId,
      { 
        $push: { listings: listing._id },
        $inc: { listingsCount: 1 }
      }
    );

    res.status(201).json({
      success: true,
      data: listing
    });

  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message
    });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));

    res.json({ urls: fileUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};
