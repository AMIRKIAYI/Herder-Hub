const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getListings,
  getOrders,
  getMessages,
  getNotifications,
  markNotificationsAsRead
} = require('../controllers/accountController');

// Protected routes (require authentication)
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/listings', getListings);
router.get('/orders', getOrders);
router.get('/messages', getMessages);
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationsAsRead);

module.exports = router;