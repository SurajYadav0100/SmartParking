const express = require('express');
const router = express.Router();
const {
  getTicketById,
  getMyTickets,
  searchTickets
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-tickets', protect, getMyTickets);
router.get('/search', protect, authorize('staff', 'admin'), searchTickets);
router.get('/:id', getTicketById);

module.exports = router;
