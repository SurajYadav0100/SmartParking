const ParkingRate = require('../models/ParkingRate');

/**
 * Calculate parking duration and parking fee based on dynamic database rates
 * @param {Date} entryTime 
 * @param {Date} exitTime 
 * @param {String} vehicleType - 'Car', 'Bike', 'SUV', 'EV'
 * @returns {Promise<Object>} { durationMinutes, durationFormatted, fee, rateDetails }
 */
const calculateParkingFee = async (entryTime, exitTime = new Date(), vehicleType = 'Car') => {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);

  // Duration in milliseconds and minutes
  const diffMs = Math.max(0, exit.getTime() - entry.getTime());
  const totalMinutes = Math.ceil(diffMs / (1000 * 60));

  // Retrieve active rate configuration for the vehicle type
  let rateConfig = await ParkingRate.findOne({ vehicleType, isActive: true });

  // Default fallback rates if DB record does not exist
  if (!rateConfig) {
    const defaults = {
      Car: { firstHourRate: 30, additionalHourRate: 20, maximumDailyRate: 200, gracePeriod: 10 },
      Bike: { firstHourRate: 15, additionalHourRate: 10, maximumDailyRate: 100, gracePeriod: 10 },
      SUV: { firstHourRate: 40, additionalHourRate: 25, maximumDailyRate: 250, gracePeriod: 10 },
      EV: { firstHourRate: 25, additionalHourRate: 15, maximumDailyRate: 180, gracePeriod: 15 }
    };
    rateConfig = defaults[vehicleType] || defaults.Car;
  }

  const { firstHourRate, additionalHourRate, maximumDailyRate, gracePeriod } = rateConfig;

  // Format readable duration: e.g. "2h 15m" or "45m"
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Grace Period Check: Free exit if exited within grace period
  if (totalMinutes <= gracePeriod) {
    return {
      durationMinutes: totalMinutes,
      durationHours: 0,
      durationFormatted,
      fee: 0,
      gracePeriodApplied: true,
      rateConfig: {
        firstHourRate,
        additionalHourRate,
        maximumDailyRate,
        gracePeriod
      }
    };
  }

  // Billable hours (fractional hour rounded up to nearest whole hour)
  const billableHours = Math.ceil(totalMinutes / 60);

  // Daily cycle calculation (24-hour cycles)
  const fullDays = Math.floor(billableHours / 24);
  const remainingHours = billableHours % 24;

  let feeForRemaining = 0;
  if (remainingHours > 0) {
    if (remainingHours === 1) {
      feeForRemaining = firstHourRate;
    } else {
      feeForRemaining = firstHourRate + (remainingHours - 1) * additionalHourRate;
    }
    // Cap remaining hours at the single-day maximum
    feeForRemaining = Math.min(feeForRemaining, maximumDailyRate);
  }

  // Total fee = full days * maxDailyRate + remaining hours fee
  let totalFee = fullDays * maximumDailyRate + feeForRemaining;

  // Ensure minimum fee is at least firstHourRate if billableHours >= 1
  if (totalFee < firstHourRate && totalMinutes > gracePeriod) {
    totalFee = firstHourRate;
  }

  return {
    durationMinutes: totalMinutes,
    durationHours: billableHours,
    durationFormatted,
    fee: totalFee,
    gracePeriodApplied: false,
    rateConfig: {
      firstHourRate,
      additionalHourRate,
      maximumDailyRate,
      gracePeriod
    }
  };
};

module.exports = {
  calculateParkingFee
};
