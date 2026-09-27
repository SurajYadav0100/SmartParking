const mongoose = require('mongoose');

const ParkingTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSession',
      required: true
    },
    qrCode: {
      type: String, // Data URL base64 image representation
      required: true
    },
    qrToken: {
      type: String, // Secure token embedded in QR
      required: true
    },
    customerName: {
      type: String,
      default: 'Guest Customer'
    },
    vehicleNumber: {
      type: String,
      required: true
    },
    vehicleType: {
      type: String,
      required: true
    },
    floorName: {
      type: String,
      required: true
    },
    slotNumber: {
      type: String,
      required: true
    },
    entryTime: {
      type: Date,
      default: Date.now
    },
    expectedExit: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ParkingTicket', ParkingTicketSchema);
