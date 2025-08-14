// routes/authRoutes.js
const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const protect = require('../middleware/auth'); // Your existing middleware
const router = express.Router();

// Auth routes

router.post('/register', register);
router.post('/login', login);

// Logout route
router.post('/logout', logout);



// Protected user endpoint
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
});


module.exports = router;