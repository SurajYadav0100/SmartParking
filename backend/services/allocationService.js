const ParkingSlot = require('../models/ParkingSlot');
const ParkingFloor = require('../models/ParkingFloor');

/**
 * Intelligent Slot Allocation Algorithm
 * Dynamically finds the optimal, compatible, available parking slot based on vehicle attributes
 * 
 * @param {Object} options
 * @param {String} options.vehicleType - 'Car', 'Bike', 'SUV', 'EV'
 * @param {Boolean} options.isEV - whether EV charging is requested
 * @param {Boolean} options.isAccessible - whether accessible/handicap parking is requested
 * @param {Number} options.preferredFloor - optional floor number preference
 * @returns {Promise<Object|null>} Allocated ParkingSlot document or null if full
 */
const allocateSlot = async ({
  vehicleType = 'Car',
  isEV = false,
  isAccessible = false,
  preferredFloor = null
}) => {
  // Define type compatibility matrix
  let compatibleTypes = [vehicleType];
  if (vehicleType === 'Car') {
    compatibleTypes = ['Car', 'SUV'];
  } else if (vehicleType === 'SUV') {
    compatibleTypes = ['SUV', 'Car'];
  } else if (vehicleType === 'EV') {
    compatibleTypes = ['EV', 'Car', 'SUV'];
  } else if (vehicleType === 'Bike') {
    compatibleTypes = ['Bike'];
  }

  // Base query: slot must be strictly Available
  const baseQuery = {
    status: 'Available'
  };

  // Preference filter matching:
  // 1. Try finding exact match with EV and Accessibility requirements on preferred floor if provided
  if (preferredFloor !== null && preferredFloor !== undefined) {
    const floor = await ParkingFloor.findOne({ floorNumber: preferredFloor, status: 'active' });
    if (floor) {
      baseQuery.floorId = floor._id;
    }
  }

  // Priority search 1: Exact vehicleType + isEV + isAccessible
  let query = {
    ...baseQuery,
    vehicleType: vehicleType,
    ...(isEV ? { isEV: true } : {}),
    ...(isAccessible ? { isAccessible: true } : {})
  };

  let candidateSlot = await ParkingSlot.findOne(query)
    .populate('floorId', 'floorNumber name')
    .sort({ floorNumber: 1, slotNumber: 1 });

  // Priority search 2: Compatible vehicle types with isEV requirement
  if (!candidateSlot && isEV) {
    candidateSlot = await ParkingSlot.findOne({
      ...baseQuery,
      vehicleType: { $in: compatibleTypes },
      isEV: true
    })
      .populate('floorId', 'floorNumber name')
      .sort({ floorNumber: 1, slotNumber: 1 });
  }

  // Priority search 3: Compatible vehicle types without strict EV constraint (if EV slots are full)
  if (!candidateSlot) {
    candidateSlot = await ParkingSlot.findOne({
      ...baseQuery,
      vehicleType: { $in: compatibleTypes },
      ...(isAccessible ? { isAccessible: true } : {})
    })
      .populate('floorId', 'floorNumber name')
      .sort({ floorNumber: 1, slotNumber: 1 });
  }

  // Priority search 4: If preferred floor had no space, try any active floor
  if (!candidateSlot && baseQuery.floorId) {
    delete baseQuery.floorId;
    candidateSlot = await ParkingSlot.findOne({
      status: 'Available',
      vehicleType: { $in: compatibleTypes }
    })
      .populate('floorId', 'floorNumber name')
      .sort({ floorNumber: 1, slotNumber: 1 });
  }

  return candidateSlot;
};

module.exports = {
  allocateSlot
};
