const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// @desc    Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats for sellers
    if (user.role === 'seller') {
      const [totalListings, activeListings] = await Promise.all([
        Listing.countDocuments({ owner: user._id }),
        Listing.countDocuments({ owner: user._id, status: 'available' })
      ]);
      
      user.totalListings = totalListings;
      user.activeListings = activeListings;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { phone, location, bio } = req.body;
    const updates = { phone, location, bio };

    // If this is a seller's first time updating profile, set sellerSince date
    if (req.user.role === 'seller' && !req.user.sellerSince) {
      updates.sellerSince = new Date();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user listings
exports.getListings = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access listings' });
    }

    const listings = await Listing.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user orders
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'seller') {
      query = { seller: req.user._id };
    } else {
      query = { buyer: req.user._id };
    }

    const orders = await Order.find(query)
      .populate(req.user.role === 'seller' ? 'buyer' : 'seller', 'username email profilePhoto')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
      .populate('sender', 'username profilePhoto')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notifications as read
exports.markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};