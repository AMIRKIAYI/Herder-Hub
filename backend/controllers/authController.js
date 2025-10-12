// backend/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/authUtils');
const { sendRegistrationEmail } = require('../utils/emailService');

// Set token cookie helper
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // true in production
    sameSite: 'None', // required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @desc    Register new user
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({ username, email, password });

    // Generate token and set cookie
    const token = generateToken(newUser._id);
    setTokenCookie(res, token);

    // Send registration email (non-blocking - don't await)
    sendRegistrationEmail(email, username)
      .then(() => {
        console.log(`Registration email sent successfully to ${email}`);
      })
      .catch(error => {
        console.warn('Failed to send registration email:', error.message);
        // Don't throw error - registration was successful even if email fails
      });

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      message: 'Registration successful! Welcome to our platform.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req; // From auth middleware
    const updates = req.body;
    
    // Fields that can be updated
    const allowedUpdates = {
      phone: updates.phone,
      location: updates.location,
      profilePhoto: updates.profilePhoto
    };
    
    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(
      key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
    
    // Add updatedAt timestamp
    allowedUpdates.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Logout user
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'None',
  });
  res.json({ message: 'Logged out successfully' });
}