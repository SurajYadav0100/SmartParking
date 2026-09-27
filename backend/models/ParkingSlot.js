const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema(
  {
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingFloor',
      required: true
    },
    floorNumber: {
      type: Number,
      required: true
    },
    slotNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      required: true,
      default: 'Car'
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
      default: 'Available'
    },
    isEV: {
      type: Boolean,
      default: false
    },
    isAccessible: {
      type: Boolean,
      default: false
    },
    currentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSession',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for slot search and fast floor filtering
ParkingSlotSchema.index({ floorId: 1, status: 1 });
ParkingSlotSchema.index({ vehicleType: 1, status: 1 });
ParkingSlotSchema.index({ slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
