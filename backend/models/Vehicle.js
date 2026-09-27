const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Please provide vehicle registration number'],
      uppercase: true,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      required: [true, 'Please select vehicle type']
    },
    model: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness per user or fast lookup by vehicleNumber
VehicleSchema.index({ vehicleNumber: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);
