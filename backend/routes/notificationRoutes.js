const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  createAnnouncement
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/announcement', protect, authorize('admin'), createAnnouncement);

module.exports = router;
