const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getUsers,
  updateUser,
  createFloor,
  updateFloor,
  deleteFloor,
  createSlot,
  updateSlot,
  deleteSlot,
  getRates,
  updateRate
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Restrict all admin routes to logged-in users with role === 'admin'
router.use(protect);
router.use(authorize('admin'));

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

// Floor Management
router.post('/floors', createFloor);
router.put('/floors/:id', updateFloor);
router.delete('/floors/:id', deleteFloor);

// Slot Management
router.post('/slots', createSlot);
router.put('/slots/:id', updateSlot);
router.delete('/slots/:id', deleteSlot);

// Parking Rate Management
router.get('/rates', getRates);
router.put('/rates', updateRate);

module.exports = router;
