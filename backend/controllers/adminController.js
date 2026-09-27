const User = require('../models/User');
const ParkingFloor = require('../models/ParkingFloor');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingSession = require('../models/ParkingSession');
const ParkingRate = require('../models/ParkingRate');
const Payment = require('../models/Payment');
const { emitSlotUpdated } = require('../services/socketService');

/**
 * @desc    Get real-time admin overview metrics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'Available' });
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'Occupied' });
    const reservedSlots = await ParkingSlot.countDocuments({ status: 'Reserved' });
    const maintenanceSlots = await ParkingSlot.countDocuments({ status: 'Maintenance' });

    // Today's date boundary
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayVehicles = await ParkingSession.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Today's Revenue
    const todayPayments = await Payment.aggregate([
      { $match: { createdAt: { $gte: startOfToday }, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayRevenue = todayPayments.length > 0 ? todayPayments[0].total : 0;

    // Total Lifetime Revenue
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Total Registered Users
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalStaff = await User.countDocuments({ role: 'staff' });

    const occupancyRate = totalSlots > 0 ? Math.round(((occupiedSlots + reservedSlots) / totalSlots) * 100) : 0;

    // Recent active sessions
    const recentSessions = await ParkingSession.find()
      .populate('slotId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        maintenanceSlots,
        occupancyRate,
        todayVehicles,
        todayRevenue,
        totalRevenue,
        totalUsers,
        totalStaff
      },
      recentSessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed analytical data for Recharts (Daily vehicles, Revenue, Peak hours, Types)
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Daily Vehicles & Revenue (last 7 days)
    const dailyDataRaw = await ParkingSession.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          vehicles: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Map 7-day array ensuring missing days have 0
    const dailyChart = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = dailyDataRaw.find((item) => item._id === dateStr);

      dailyChart.push({
        date: dateStr,
        day: dayName,
        vehicles: found ? found.vehicles : 0,
        revenue: found ? found.revenue : 0
      });
    }

    // 2. Vehicle Type Distribution
    const vehicleTypeAgg = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] }
          }
        }
      }
    ]);

    const vehicleTypeChart = vehicleTypeAgg.map((item) => ({
      type: item._id,
      totalSlots: item.count,
      occupied: item.occupied,
      occupancy: item.count > 0 ? Math.round((item.occupied / item.count) * 100) : 0
    }));

    // 3. Peak Hours Breakdown (00:00 to 23:00)
    const peakHoursRaw = await ParkingSession.aggregate([
      {
        $group: {
          _id: { $hour: '$entryTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const peakHoursChart = [];
    for (let h = 8; h <= 22; h++) {
      const found = peakHoursRaw.find((item) => item._id === h);
      const label = `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;
      peakHoursChart.push({
        hour: label,
        rawHour: h,
        count: found ? found.count : 0
      });
    }

    // 4. Floor-wise Occupancy
    const floors = await ParkingFloor.find().sort({ floorNumber: 1 });
    const floorOccupancyChart = await Promise.all(
      floors.map(async (f) => {
        const total = await ParkingSlot.countDocuments({ floorId: f._id });
        const occupied = await ParkingSlot.countDocuments({ floorId: f._id, status: 'Occupied' });
        const available = await ParkingSlot.countDocuments({ floorId: f._id, status: 'Available' });
        return {
          name: f.name,
          floorNumber: f.floorNumber,
          total,
          occupied,
          available,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        dailyChart,
        vehicleTypeChart,
        peakHoursChart,
        floorOccupancyChart
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manage Users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user status or role
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} updated successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Floor CRUD
 */
const createFloor = async (req, res, next) => {
  try {
    const { floorNumber, name, totalSlots } = req.body;
    const floor = await ParkingFloor.create({ floorNumber, name, totalSlots });
    res.status(201).json({ success: true, data: floor });
  } catch (error) {
    next(error);
  }
};

const updateFloor = async (req, res, next) => {
  try {
    const floor = await ParkingFloor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: floor });
  } catch (error) {
    next(error);
  }
};

const deleteFloor = async (req, res, next) => {
  try {
    await ParkingFloor.findByIdAndDelete(req.params.id);
    await ParkingSlot.deleteMany({ floorId: req.params.id });
    res.status(200).json({ success: true, message: 'Floor and its slots removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Slot CRUD & Status Changes
 */
const createSlot = async (req, res, next) => {
  try {
    const { floorId, floorNumber, slotNumber, vehicleType, isEV, isAccessible } = req.body;
    const slot = await ParkingSlot.create({
      floorId,
      floorNumber,
      slotNumber: slotNumber.trim().toUpperCase(),
      vehicleType,
      isEV: !!isEV,
      isAccessible: !!isAccessible
    });
    emitSlotUpdated(slot);
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    next(error);
  }
};

const updateSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitSlotUpdated(slot);
    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    await ParkingSlot.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Parking Rate Management
 */
const getRates = async (req, res, next) => {
  try {
    const rates = await ParkingRate.find();
    res.status(200).json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
};

const updateRate = async (req, res, next) => {
  try {
    const { vehicleType, firstHourRate, additionalHourRate, maximumDailyRate, gracePeriod } = req.body;
    const rate = await ParkingRate.findOneAndUpdate(
      { vehicleType },
      { firstHourRate, additionalHourRate, maximumDailyRate, gracePeriod },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: `Rates updated for ${vehicleType}`, data: rate });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getUsers,
  updateUser,
  createFloor,
  updateFloor,
  deleteFloor,
  createSlot,
  updateSlot,
  deleteSlot,
  getRates,
  updateRate
};
