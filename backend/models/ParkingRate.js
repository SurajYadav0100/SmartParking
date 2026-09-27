const mongoose = require('mongoose');

const ParkingRateSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      required: true,
      unique: true
    },
    firstHourRate: {
      type: Number,
      required: true,
      default: 30
    },
    additionalHourRate: {
      type: Number,
      required: true,
      default: 20
    },
    maximumDailyRate: {
      type: Number,
      required: true,
      default: 200
    },
    gracePeriod: {
      type: Number, // In minutes (free if exited within grace period)
      default: 10
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ParkingRate', ParkingRateSchema);
