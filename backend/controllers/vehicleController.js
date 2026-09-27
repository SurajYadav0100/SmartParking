const Vehicle = require('../models/Vehicle');
const ParkingSession = require('../models/ParkingSession');

/**
 * @desc    Get all vehicles for current user
 * @route   GET /api/vehicles
 * @access  Private
 */
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Private
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Only owner or staff/admin can view
    if (vehicle.userId.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this vehicle'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new vehicle
 * @route   POST /api/vehicles
 * @access  Private
 */
const addVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, vehicleType, model, color } = req.body;

    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number and vehicle type are required'
      });
    }

    const formattedNumber = vehicleNumber.trim().toUpperCase().replace(/\s+/g, '');

    // Check if vehicle already exists for this user
    const existing = await Vehicle.findOne({
      userId: req.user.id,
      vehicleNumber: formattedNumber
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${formattedNumber} is already added in your account.`
      });
    }

    const vehicle = await Vehicle.create({
      userId: req.user.id,
      vehicleNumber: formattedNumber,
      vehicleType,
      model: model ? model.trim() : '',
      color: color ? color.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private
 */
const updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    const { vehicleType, model, color } = req.body;
    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (model !== undefined) vehicle.model = model.trim();
    if (color !== undefined) vehicle.color = color.trim();

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vehicle'
      });
    }

    // Check if vehicle has an ongoing active parking session
    const activeSession = await ParkingSession.findOne({
      vehicleNumber: vehicle.vehicleNumber,
      status: 'active'
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle ${vehicle.vehicleNumber} because it is currently parked in slot.`
      });
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vehicle removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle
};
