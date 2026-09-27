const mongoose = require('mongoose');

const ParkingFloorSchema = new mongoose.Schema(
  {
    floorNumber: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    totalSlots: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'maintenance'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ParkingFloor', ParkingFloorSchema);
