const ParkingTicket = require('../models/ParkingTicket');
const ParkingSession = require('../models/ParkingSession');

/**
 * @desc    Get ticket details by ticket ID
 * @route   GET /api/tickets/:id
 * @access  Public / Private
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    const ticket = await ParkingTicket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${ticketId} not found`
      });
    }

    const session = await ParkingSession.findById(ticket.sessionId).populate('slotId');

    res.status(200).json({
      success: true,
      data: {
        ticket,
        session
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's active and past parking tickets
 * @route   GET /api/tickets/my-tickets
 * @access  Private (Customer)
 */
const getMyTickets = async (req, res, next) => {
  try {
    // Find all sessions for this user
    const sessions = await ParkingSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('slotId')
      .populate('paymentId');

    const sessionIds = sessions.map((s) => s._id);
    const tickets = await ParkingTicket.find({ sessionId: { $in: sessionIds } }).sort({ createdAt: -1 });

    // Combine tickets with session state
    const combined = tickets.map((t) => {
      const matchSession = sessions.find((s) => s._id.toString() === t.sessionId.toString());
      return {
        ...t.toObject(),
        session: matchSession || null
      };
    });

    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search tickets (by ticket ID, vehicle number, phone)
 * @route   GET /api/tickets/search
 * @access  Private (Staff / Admin)
 */
const searchTickets = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query string is required'
      });
    }

    const cleanQuery = query.trim();
    const regex = new RegExp(cleanQuery, 'i');

    const tickets = await ParkingTicket.find({
      $or: [
        { ticketId: regex },
        { vehicleNumber: regex },
        { customerName: regex }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTicketById,
  getMyTickets,
  searchTickets
};
