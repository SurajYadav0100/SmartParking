const express = require('express');
const router = express.Router();
const {
  getAvailability,
  getFloors,
  getSlots,
  requestSlotAllocation,
  processVehicleEntry,
  lookupExitFee,
  processVehicleExit
} = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public lookup endpoints
router.get('/availability', getAvailability);
router.get('/floors', getFloors);
router.get('/slots', getSlots);
router.post('/allocate', requestSlotAllocation);
router.post('/exit-lookup', lookupExitFee);

// Optional auth for vehicle entry (supports both logged-in users and anonymous staff entry)
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/entry', optionalAuth, processVehicleEntry);
router.post('/exit', optionalAuth, processVehicleExit);

module.exports = router;
