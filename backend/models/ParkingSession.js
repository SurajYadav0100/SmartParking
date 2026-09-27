const mongoose = require('mongoose');

const ParkingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerName: {
      type: String,
      default: 'Guest Customer'
    },
    customerPhone: {
      type: String,
      default: ''
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      required: true
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: true
    },
    ticketId: {
      type: String,
      required: true,
      unique: true
    },
    entryTime: {
      type: Date,
      default: Date.now
    },
    exitTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    amount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    }
  },
  {
    timestamps: true
  }
);

ParkingSessionSchema.index({ status: 1 });
ParkingSessionSchema.index({ vehicleNumber: 1 });
ParkingSessionSchema.index({ ticketId: 1 });

module.exports = mongoose.model('ParkingSession', ParkingSessionSchema);
