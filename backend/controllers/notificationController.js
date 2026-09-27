const Notification = require('../models/Notification');
const { emitBroadcastNotification, emitNotificationToUser } = require('../services/socketService');

/**
 * @desc    Get user notifications and general announcements
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const userRole = req.user ? req.user.role : 'customer';

    const notifications = await Notification.find({
      $or: [
        { userId: userId },
        { role: 'all' },
        { role: userRole }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create mall announcement (Admin)
 * @route   POST /api/notifications/announcement
 * @access  Private (Admin)
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, type = 'info', role = 'all' } = req.body;
    const announcement = await Notification.create({
      title,
      message,
      type,
      role
    });

    emitBroadcastNotification(announcement);

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createAnnouncement
};
