const ParkingFloor = require('../models/ParkingFloor');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingSession = require('../models/ParkingSession');
const ParkingTicket = require('../models/ParkingTicket');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const { allocateSlot } = require('../services/allocationService');
const { calculateParkingFee } = require('../services/feeCalculatorService');
const { generateTicketQR, verifyQRPayload } = require('../services/qrService');
const { emitSlotUpdated, emitSessionStarted, emitSessionEnded } = require('../services/socketService');
const { generateTicketId, generateReceiptId, generateTransactionId } = require('../utils/idGenerator');

/**
 * @desc    Get overall mall parking availability & breakdown by floor & vehicle type
 * @route   GET /api/parking/availability
 * @access  Public
 */
const getAvailability = async (req, res, next) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'Available' });
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'Occupied' });
    const reservedSlots = await ParkingSlot.countDocuments({ status: 'Reserved' });
    const maintenanceSlots = await ParkingSlot.countDocuments({ status: 'Maintenance' });

    // Aggregate by floor
    const floors = await ParkingFloor.find({ status: 'active' }).sort({ floorNumber: 1 });
    const floorBreakdown = await Promise.all(
      floors.map(async (floor) => {
        const total = await ParkingSlot.countDocuments({ floorId: floor._id });
        const available = await ParkingSlot.countDocuments({ floorId: floor._id, status: 'Available' });
        const occupied = await ParkingSlot.countDocuments({ floorId: floor._id, status: 'Occupied' });
        const reserved = await ParkingSlot.countDocuments({ floorId: floor._id, status: 'Reserved' });

        return {
          floorId: floor._id,
          floorNumber: floor.floorNumber,
          name: floor.name,
          total,
          available,
          occupied,
          reserved,
          occupancyPercentage: total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0
        };
      })
    );

    // Aggregate by vehicle type
    const vehicleTypes = ['Car', 'Bike', 'SUV', 'EV'];
    const typeBreakdown = await Promise.all(
      vehicleTypes.map(async (type) => {
        const total = await ParkingSlot.countDocuments({ vehicleType: type });
        const available = await ParkingSlot.countDocuments({ vehicleType: type, status: 'Available' });
        const occupied = await ParkingSlot.countDocuments({ vehicleType: type, status: 'Occupied' });

        return {
          type,
          total,
          available,
          occupied
        };
      })
    );

    const occupancyRate = totalSlots > 0 ? Math.round(((occupiedSlots + reservedSlots) / totalSlots) * 100) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        maintenanceSlots,
        occupancyRate
      },
      floors: floorBreakdown,
      vehicleTypes: typeBreakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all parking floors
 * @route   GET /api/parking/floors
 * @access  Public
 */
const getFloors = async (req, res, next) => {
  try {
    const floors = await ParkingFloor.find().sort({ floorNumber: 1 });
    res.status(200).json({
      success: true,
      data: floors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get slots by floor with optional filters
 * @route   GET /api/parking/slots
 * @access  Public
 */
const getSlots = async (req, res, next) => {
  try {
    const { floorNumber, vehicleType, status, isEV } = req.query;
    const query = {};

    if (floorNumber) query.floorNumber = Number(floorNumber);
    if (vehicleType) query.vehicleType = vehicleType;
    if (status) query.status = status;
    if (isEV !== undefined) query.isEV = isEV === 'true';

    const slots = await ParkingSlot.find(query)
      .populate('floorId', 'name floorNumber')
      .populate('currentSessionId', 'ticketId vehicleNumber entryTime')
      .sort({ floorNumber: 1, slotNumber: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dynamic slot allocation query / recommendation
 * @route   POST /api/parking/allocate
 * @access  Private / Public
 */
const requestSlotAllocation = async (req, res, next) => {
  try {
    const { vehicleType = 'Car', isEV = false, isAccessible = false, preferredFloor = null } = req.body;

    const allocatedSlot = await allocateSlot({
      vehicleType,
      isEV,
      isAccessible,
      preferredFloor: preferredFloor ? Number(preferredFloor) : null
    });

    if (!allocatedSlot) {
      return res.status(404).json({
        success: false,
        message: `No available slots matching vehicle type '${vehicleType}'. Mall parking may be full.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Optimal slot ${allocatedSlot.slotNumber} found on Floor ${allocatedSlot.floorNumber}`,
      data: allocatedSlot
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process Vehicle Entry (Customer or Staff)
 * @route   POST /api/parking/entry
 * @access  Private (Customer or Staff or Admin)
 */
const processVehicleEntry = async (req, res, next) => {
  try {
    let {
      vehicleNumber,
      vehicleType = 'Car',
      slotId = null,
      customerName = '',
      customerPhone = '',
      isEV = false,
      isAccessible = false,
      preferredFloor = null
    } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      });
    }

    vehicleNumber = vehicleNumber.trim().toUpperCase().replace(/\s+/g, '');

    // Business Rule 1: One slot cannot be assigned to multiple active vehicles, and a vehicle cannot have multiple active sessions
    const existingActiveSession = await ParkingSession.findOne({
      vehicleNumber,
      status: 'active'
    }).populate('slotId');

    if (existingActiveSession) {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${vehicleNumber} is already parked in Slot ${existingActiveSession.slotId?.slotNumber || 'active'} (Ticket: ${existingActiveSession.ticketId}).`,
        activeTicketId: existingActiveSession.ticketId
      });
    }

    // Determine target slot
    let targetSlot = null;
    if (slotId) {
      targetSlot = await ParkingSlot.findById(slotId).populate('floorId');
      if (!targetSlot) {
        return res.status(404).json({
          success: false,
          message: 'Selected slot does not exist'
        });
      }
      if (targetSlot.status !== 'Available') {
        return res.status(400).json({
          success: false,
          message: `Slot ${targetSlot.slotNumber} is already ${targetSlot.status}. Please select another slot.`
        });
      }
    } else {
      // Backend dynamic algorithm allocation
      targetSlot = await allocateSlot({
        vehicleType,
        isEV,
        isAccessible,
        preferredFloor
      });

      if (!targetSlot) {
        return res.status(404).json({
          success: false,
          message: `Sorry, no available parking slots found for vehicle type '${vehicleType}'.`
        });
      }
    }

    // Determine customer info
    const userId = req.user ? req.user._id : null;
    if (req.user) {
      customerName = customerName || req.user.name;
      customerPhone = customerPhone || req.user.phone;
    } else {
      customerName = customerName || 'Mall Guest';
    }

    // Link vehicle reference if user already owns this vehicle in DB
    let vehicleDoc = null;
    if (userId) {
      vehicleDoc = await Vehicle.findOne({ userId, vehicleNumber });
    }

    // Generate unique Ticket ID
    const ticketId = generateTicketId();

    // Create Parking Session
    const session = await ParkingSession.create({
      userId,
      customerName,
      customerPhone,
      vehicleId: vehicleDoc ? vehicleDoc._id : null,
      vehicleNumber,
      vehicleType,
      slotId: targetSlot._id,
      ticketId,
      entryTime: new Date(),
      status: 'active',
      paymentStatus: 'pending'
    });

    // Generate Digital QR Code
    const { qrToken, qrCodeDataUrl } = await generateTicketQR(ticketId, session._id);

    // Create Digital Ticket
    const expectedExit = new Date(Date.now() + 4 * 60 * 60 * 1000); // Default 4 hours estimated
    const ticket = await ParkingTicket.create({
      ticketId,
      sessionId: session._id,
      qrCode: qrCodeDataUrl,
      qrToken,
      customerName,
      vehicleNumber,
      vehicleType,
      floorName: targetSlot.floorId?.name || `Floor ${targetSlot.floorNumber}`,
      slotNumber: targetSlot.slotNumber,
      entryTime: session.entryTime,
      expectedExit,
      status: 'active'
    });

    // Update Slot Status to 'Occupied'
    targetSlot.status = 'Occupied';
    targetSlot.currentSessionId = session._id;
    await targetSlot.save();

    // Emit Real-time Socket.IO updates
    emitSlotUpdated(targetSlot);
    emitSessionStarted({ session, ticket, slot: targetSlot });

    res.status(201).json({
      success: true,
      message: `Vehicle ${vehicleNumber} parked successfully at ${targetSlot.slotNumber}`,
      data: {
        ticket,
        session,
        slot: {
          slotNumber: targetSlot.slotNumber,
          floorNumber: targetSlot.floorNumber,
          floorName: targetSlot.floorId?.name || `Floor ${targetSlot.floorNumber}`,
          vehicleType: targetSlot.vehicleType
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lookup parking session at exit & calculate current fee
 * @route   POST /api/parking/exit-lookup
 * @access  Public / Staff / Customer
 */
const lookupExitFee = async (req, res, next) => {
  try {
    const { identifier } = req.body; // Can be ticketId, raw QR payload, or vehicleNumber

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Ticket ID, Vehicle Number, or QR data'
      });
    }

    // Parse identifier if it's a JSON QR payload
    let searchTicketId = identifier.trim();
    const qrParsed = verifyQRPayload(identifier);
    if (qrParsed.isValid && qrParsed.ticketId) {
      searchTicketId = qrParsed.ticketId;
    }

    // Try finding by ticketId first, then vehicleNumber
    let session = await ParkingSession.findOne({
      ticketId: searchTicketId,
      status: 'active'
    }).populate('slotId');

    if (!session) {
      session = await ParkingSession.findOne({
        vehicleNumber: identifier.trim().toUpperCase().replace(/\s+/g, ''),
        status: 'active'
      }).populate('slotId');
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active parking session found for the provided Ticket ID or Vehicle Number.'
      });
    }

    const ticket = await ParkingTicket.findOne({ ticketId: session.ticketId });

    // Calculate dynamic fee up to the present moment
    const exitTime = new Date();
    const calculation = await calculateParkingFee(session.entryTime, exitTime, session.vehicleType);

    res.status(200).json({
      success: true,
      data: {
        session,
        ticket,
        slot: session.slotId,
        entryTime: session.entryTime,
        exitTime,
        durationMinutes: calculation.durationMinutes,
        durationFormatted: calculation.durationFormatted,
        fee: calculation.fee,
        gracePeriodApplied: calculation.gracePeriodApplied,
        rateConfig: calculation.rateConfig,
        paymentStatus: session.paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process Vehicle Exit (Completes session, releases slot, produces receipt)
 * @route   POST /api/parking/exit
 * @access  Private (Staff or Customer after payment)
 */
const processVehicleExit = async (req, res, next) => {
  try {
    const { ticketId, paymentMethod = 'Cash', paymentNotes = '' } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required to process vehicle exit'
      });
    }

    const session = await ParkingSession.findOne({ ticketId, status: 'active' }).populate('slotId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active parking session found for this ticket'
      });
    }

    const exitTime = new Date();
    const feeResult = await calculateParkingFee(session.entryTime, exitTime, session.vehicleType);
    const amount = feeResult.fee;

    // Check payment status: if fee > 0 and payment is not verified yet, handle cash or direct settlement
    let paymentRecord = null;
    if (amount > 0) {
      // Check if already paid
      paymentRecord = await Payment.findOne({ sessionId: session._id, status: 'success' });

      if (!paymentRecord) {
        // If staff is exiting with Cash or Customer is doing immediate exit checkout
        const receiptId = generateReceiptId();
        const transactionId = generateTransactionId(paymentMethod === 'Cash' ? 'CSH' : 'SET');

        paymentRecord = await Payment.create({
          sessionId: session._id,
          userId: session.userId,
          ticketId: session.ticketId,
          vehicleNumber: session.vehicleNumber,
          amount,
          paymentMethod,
          transactionId,
          receiptId,
          status: 'success',
          paidAt: exitTime
        });
      }
    } else {
      // Grace period exit (₹0 fee)
      const receiptId = generateReceiptId();
      const transactionId = generateTransactionId('FREE');

      paymentRecord = await Payment.create({
        sessionId: session._id,
        userId: session.userId,
        ticketId: session.ticketId,
        vehicleNumber: session.vehicleNumber,
        amount: 0,
        paymentMethod: 'Cash',
        transactionId,
        receiptId,
        status: 'success',
        paidAt: exitTime
      });
    }

    // Update Session
    session.exitTime = exitTime;
    session.duration = feeResult.durationMinutes;
    session.amount = amount;
    session.status = 'completed';
    session.paymentStatus = 'paid';
    session.paymentId = paymentRecord._id;
    await session.save();

    // Update Ticket
    await ParkingTicket.findOneAndUpdate(
      { ticketId: session.ticketId },
      { status: 'completed' }
    );

    // Release Parking Slot: Set back to 'Available'
    const slot = await ParkingSlot.findById(session.slotId);
    if (slot) {
      slot.status = 'Available';
      slot.currentSessionId = null;
      await slot.save();

      // Emit Real-time Socket.IO events to all dashboards
      emitSlotUpdated(slot);
    }

    emitSessionEnded({ session, slot });

    res.status(200).json({
      success: true,
      message: `Parking session closed successfully. Slot ${slot?.slotNumber || ''} is now Available.`,
      receipt: {
        receiptId: paymentRecord.receiptId,
        ticketId: session.ticketId,
        vehicleNumber: session.vehicleNumber,
        vehicleType: session.vehicleType,
        slotNumber: slot?.slotNumber,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        duration: feeResult.durationFormatted,
        amount: paymentRecord.amount,
        paymentMethod: paymentRecord.paymentMethod,
        transactionId: paymentRecord.transactionId,
        paidAt: paymentRecord.paidAt,
        status: 'Completed'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  getFloors,
  getSlots,
  requestSlotAllocation,
  processVehicleEntry,
  lookupExitFee,
  processVehicleExit
};
