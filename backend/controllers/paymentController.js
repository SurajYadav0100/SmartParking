const crypto = require('crypto');
const Payment = require('../models/Payment');
const ParkingSession = require('../models/ParkingSession');
const ParkingTicket = require('../models/ParkingTicket');
const { razorpayInstance, isRazorpayConfigured } = require('../config/razorpay');
const { calculateParkingFee } = require('../services/feeCalculatorService');
const { generateReceiptId, generateTransactionId } = require('../utils/idGenerator');

/**
 * @desc    Initialize payment order (Razorpay or Demo Mode)
 * @route   POST /api/payments/create-order
 * @access  Private / Public
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    const session = await ParkingSession.findOne({ ticketId, status: 'active' });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active parking session found for this ticket'
      });
    }

    // Dynamic fee calculation
    const feeCalculation = await calculateParkingFee(session.entryTime, new Date(), session.vehicleType);
    const amount = feeCalculation.fee;

    // If fee is 0 (within grace period)
    if (amount === 0) {
      return res.status(200).json({
        success: true,
        mode: 'free',
        message: 'Vehicle is within free grace period. No payment required.',
        amount: 0,
        ticketId
      });
    }

    // Check if Razorpay is configured with real keys
    if (isRazorpayConfigured() && razorpayInstance) {
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      };

      const order = await razorpayInstance.orders.create(options);

      return res.status(200).json({
        success: true,
        mode: 'razorpay',
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        ticketId,
        session
      });
    }

    // Fallback: SmartPark Interactive Demo Payment Mode
    const demoOrderId = `demo_ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return res.status(200).json({
      success: true,
      mode: 'demo',
      message: 'Operating in SmartPark Demo Payment Gateway Mode',
      orderId: demoOrderId,
      amount: amount,
      currency: 'INR',
      keyId: 'demo_key_smartpark',
      ticketId,
      duration: feeCalculation.durationFormatted,
      session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment and generate digital receipt
 * @route   POST /api/payments/verify
 * @access  Private / Public
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      ticketId,
      paymentMethod = 'UPI',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      demoTransactionId
    } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    const session = await ParkingSession.findOne({ ticketId, status: 'active' }).populate('slotId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found for this ticket'
      });
    }

    // Calculate current fee
    const feeCalculation = await calculateParkingFee(session.entryTime, new Date(), session.vehicleType);
    const amount = feeCalculation.fee;

    // Verify Razorpay if live
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && isRazorpayConfigured()) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid transaction signature'
        });
      }
    }

    // Generate unique receipt and transaction IDs
    const receiptId = generateReceiptId();
    const transactionId =
      razorpay_payment_id ||
      demoTransactionId ||
      generateTransactionId(paymentMethod.substring(0, 3).toUpperCase());

    // Record Payment
    const payment = await Payment.create({
      sessionId: session._id,
      userId: session.userId || (req.user ? req.user._id : null),
      ticketId: session.ticketId,
      vehicleNumber: session.vehicleNumber,
      amount,
      paymentMethod,
      transactionId,
      receiptId,
      status: 'success',
      paidAt: new Date(),
      razorpayPaymentId: razorpay_payment_id || null,
      razorpayOrderId: razorpay_order_id || null,
      razorpaySignature: razorpay_signature || null
    });

    // Mark session as paid
    session.paymentStatus = 'paid';
    session.amount = amount;
    session.paymentId = payment._id;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully! Receipt generated.',
      receipt: {
        receiptId: payment.receiptId,
        ticketId: session.ticketId,
        vehicleNumber: session.vehicleNumber,
        vehicleType: session.vehicleType,
        slotNumber: session.slotId?.slotNumber || 'Slot',
        floorNumber: session.slotId?.floorNumber,
        entryTime: session.entryTime,
        paidAt: payment.paidAt,
        duration: feeCalculation.durationFormatted,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: 'PAID'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's payment history
 * @route   GET /api/payments/history
 * @access  Private (Customer)
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('sessionId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single receipt details
 * @route   GET /api/payments/receipt/:receiptId
 * @access  Public / Private
 */
const getReceipt = async (req, res, next) => {
  try {
    const { receiptId } = req.params;

    const payment = await Payment.findOne({ receiptId }).populate({
      path: 'sessionId',
      populate: { path: 'slotId' }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const session = payment.sessionId;

    res.status(200).json({
      success: true,
      receipt: {
        receiptId: payment.receiptId,
        ticketId: payment.ticketId,
        vehicleNumber: payment.vehicleNumber,
        vehicleType: session?.vehicleType || 'Vehicle',
        slotNumber: session?.slotId?.slotNumber || 'Assigned Slot',
        floorNumber: session?.slotId?.floorNumber,
        entryTime: session?.entryTime,
        exitTime: session?.exitTime || payment.paidAt,
        duration: session?.duration ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m` : 'Completed',
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        status: payment.status.toUpperCase()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getReceipt
};
