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

 

    // Build query object
    const query = { status };

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Animal type filter - handle both array and string
    if (animalType) {
  // Handle comma-separated values (from URL query string)
  if (typeof animalType === 'string' && animalType.includes(',')) {
    const animalTypes = animalType.split(',');
    
    // Convert plural to singular for database query
    const singularAnimalTypes = animalTypes.map(type => {
      const pluralToSingular = {
        'Cattle': 'Cattle', // Cattle stays the same (it's already singular collective noun)
        'Goats': 'Goat',
        'Sheep': 'Sheep', // Sheep stays the same (singular and plural are the same)
        'Camels': 'Camel', 
        'Donkeys': 'Donkey',
        'Poultry': 'Poultry' // Poultry stays the same (collective noun)
      };
      return pluralToSingular[type] || type;
    });
    
    query.animalType = { $in: singularAnimalTypes };
  } 
  // Handle array (from frontend)
  else if (Array.isArray(animalType)) {
    // Convert plural to singular for database query
    const singularAnimalTypes = animalType.map(type => {
      const pluralToSingular = {
        'Cattle': 'Cattle',
        'Goats': 'Goat',
        'Sheep': 'Sheep',
        'Camels': 'Camel',
        'Donkeys': 'Donkey',
        'Poultry': 'Poultry'
      };
      return pluralToSingular[type] || type;
    });
    
    query.animalType = { $in: singularAnimalTypes };
  } 
  // Handle single value
  else {
    // Convert plural to singular for single value
    const pluralToSingular = {
      'Cattle': 'Cattle',
      'Goats': 'Goat',
      'Sheep': 'Sheep',
      'Camels': 'Camel',
      'Donkeys': 'Donkey',
      'Poultry': 'Poultry'
    };
    query.animalType = pluralToSingular[animalType] || animalType;
  }
}

    // Breed filter - handle both array and string
    if (breed) {
      if (typeof breed === 'string' && breed.includes(',')) {
        query.breed = { $in: breed.split(',') };
      } else if (Array.isArray(breed)) {
        query.breed = { $in: breed };
      } else {
        query.breed = breed;
      }
    }

    // Location filter - handle both array and string
    if (location) {
      if (typeof location === 'string' && location.includes(',')) {
        query.location = { $in: location.split(',') };
      } else if (Array.isArray(location)) {
        query.location = { $in: location };
      } else {
        query.location = location;
      }
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Debug log to see the final query


    const skip = (page - 1) * limit;

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);


    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ 
      message: 'Server error while fetching listings',
      error: error.message 
    });
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
