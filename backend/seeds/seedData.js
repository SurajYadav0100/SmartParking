const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Load environment config
dotenv.config();

// Import Models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const ParkingFloor = require('../models/ParkingFloor');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingSession = require('../models/ParkingSession');
const ParkingTicket = require('../models/ParkingTicket');
const Payment = require('../models/Payment');
const ParkingRate = require('../models/ParkingRate');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartpark';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log(' Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ParkingFloor.deleteMany({}),
      ParkingSlot.deleteMany({}),
      ParkingSession.deleteMany({}),
      ParkingTicket.deleteMany({}),
      Payment.deleteMany({}),
      ParkingRate.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // 1. Seed Parking Rates
    console.log('📊 Seeding Parking Rates...');
    const rates = await ParkingRate.create([
      {
        vehicleType: 'Car',
        firstHourRate: 30,
        additionalHourRate: 20,
        maximumDailyRate: 200,
        gracePeriod: 10,
        isActive: true
      },
      {
        vehicleType: 'Bike',
        firstHourRate: 15,
        additionalHourRate: 10,
        maximumDailyRate: 100,
        gracePeriod: 10,
        isActive: true
      },
      {
        vehicleType: 'SUV',
        firstHourRate: 40,
        additionalHourRate: 25,
        maximumDailyRate: 250,
        gracePeriod: 10,
        isActive: true
      },
      {
        vehicleType: 'EV',
        firstHourRate: 25,
        additionalHourRate: 15,
        maximumDailyRate: 180,
        gracePeriod: 15,
        isActive: true
      }
    ]);

    // 2. Seed Users
    console.log('👥 Seeding Users...');
    const adminUser = await User.create({
      name: 'Mall Admin',
      email: 'admin@smartpark.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    const staffUser = await User.create({
      name: 'Staff Operator John',
      email: 'staff@smartpark.com',
      phone: '9876543211',
      password: 'staff123',
      role: 'staff',
      status: 'active'
    });

    const customerUser = await User.create({
      name: 'Suraj Yadav',
      email: 'customer@smartpark.com',
      phone: '9876543212',
      password: 'customer123',
      role: 'customer',
      status: 'active'
    });

    const customerUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@smartpark.com',
      phone: '9876543213',
      password: 'customer123',
      role: 'customer',
      status: 'active'
    });

    // 3. Seed Vehicles
    console.log('🚗 Seeding Vehicles...');
    const car1 = await Vehicle.create({
      userId: customerUser._id,
      vehicleNumber: 'DL01AB1234',
      vehicleType: 'Car',
      model: 'Honda City',
      color: 'Silver'
    });

    const car2 = await Vehicle.create({
      userId: customerUser._id,
      vehicleNumber: 'UP16CD5678',
      vehicleType: 'EV',
      model: 'Tata Nexon EV',
      color: 'Teal Blue'
    });

    const bike1 = await Vehicle.create({
      userId: customerUser._id,
      vehicleNumber: 'MH02EF9012',
      vehicleType: 'Bike',
      model: 'Royal Enfield Hunter 350',
      color: 'Dapper Black'
    });

    const car3 = await Vehicle.create({
      userId: customerUser2._id,
      vehicleNumber: 'KA03GH3456',
      vehicleType: 'SUV',
      model: 'Hyundai Creta',
      color: 'Polar White'
    });

    // 4. Seed Parking Floors (Floor 1: 150, Floor 2: 200, Floor 3: 150 = 500 slots)
    console.log('🏢 Seeding Parking Floors (Total 500 slots)...');
    const floor1 = await ParkingFloor.create({
      floorNumber: 1,
      name: 'Floor 1 — Ground Level',
      totalSlots: 150,
      status: 'active'
    });

    const floor2 = await ParkingFloor.create({
      floorNumber: 2,
      name: 'Floor 2 — Mezzanine Deck',
      totalSlots: 200,
      status: 'active'
    });

    const floor3 = await ParkingFloor.create({
      floorNumber: 3,
      name: 'Floor 3 — Upper Terrace',
      totalSlots: 150,
      status: 'active'
    });

    // 5. Seed 500 Parking Slots
    console.log('🅿️ Generating 500 Parking Slots across 3 floors...');
    const slotDocs = [];

    const generateFloorSlots = (floorDoc, floorNum, totalCount, distribution) => {
      // distribution: { car: count, bike: count, suv: count, ev: count }
      let currentNumber = 1;

      // Helper to generate a batch of slots
      const addBatch = (type, count, isEV = false, isAccessible = false) => {
        for (let i = 0; i < count; i++) {
          const paddedNum = String(currentNumber).padStart(3, '0');
          const prefix = type === 'Bike' ? 'B' : type === 'EV' ? 'E' : type === 'SUV' ? 'S' : 'C';
          const slotNumber = `F${floorNum}-${prefix}${paddedNum}`;

          slotDocs.push({
            floorId: floorDoc._id,
            floorNumber: floorNum,
            slotNumber,
            vehicleType: type,
            status: 'Available',
            isEV,
            isAccessible,
            currentSessionId: null
          });
          currentNumber++;
        }
      };

      addBatch('Car', distribution.car - distribution.accessible, false, false);
      addBatch('Car', distribution.accessible, false, true); // Accessible slots
      addBatch('Bike', distribution.bike, false, false);
      addBatch('SUV', distribution.suv, false, false);
      addBatch('EV', distribution.ev, true, false); // Dedicated EV charging slots
    };

    // Floor 1: 150 slots (Car: 90 incl 6 accessible, Bike: 30, SUV: 20, EV: 10)
    generateFloorSlots(floor1, 1, 150, { car: 90, accessible: 6, bike: 30, suv: 20, ev: 10 });

    // Floor 2: 200 slots (Car: 130 incl 8 accessible, Bike: 30, SUV: 25, EV: 15)
    generateFloorSlots(floor2, 2, 200, { car: 130, accessible: 8, bike: 30, suv: 25, ev: 15 });

    // Floor 3: 150 slots (Car: 100 incl 4 accessible, Bike: 20, SUV: 20, EV: 10)
    generateFloorSlots(floor3, 3, 150, { car: 100, accessible: 4, bike: 20, suv: 20, ev: 10 });

    const insertedSlots = await ParkingSlot.insertMany(slotDocs);
    console.log(` Created ${insertedSlots.length} slots successfully.`);

    // 6. Set up a realistic live demo state:
    // Mark a few slots as Occupied with active sessions, a few as Reserved, and 4 as Maintenance
    console.log('⚡ Setting up demo active parking sessions & tickets...');

    // Pick 2 slots for our demo customer
    const customerSlot = insertedSlots.find((s) => s.slotNumber === 'F1-C001');
    const customerSlot2 = insertedSlots.find((s) => s.slotNumber === 'F1-E141');

    // Create an active session and digital QR ticket for DL01AB1234
    const ticketId1 = 'SP-2026-000123';
    const entryTime1 = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

    const session1 = await ParkingSession.create({
      userId: customerUser._id,
      customerName: customerUser.name,
      customerPhone: customerUser.phone,
      vehicleId: car1._id,
      vehicleNumber: car1.vehicleNumber,
      vehicleType: car1.vehicleType,
      slotId: customerSlot._id,
      ticketId: ticketId1,
      entryTime: entryTime1,
      status: 'active',
      paymentStatus: 'pending'
    });

    // Generate real QR code for Ticket 1
    const qrSecret = process.env.JWT_SECRET || 'smartpark_qr_salt_secret';
    const qrToken1 = crypto
      .createHmac('sha256', qrSecret)
      .update(`${ticketId1}:${session1._id}`)
      .digest('hex')
      .substring(0, 32);

    const qrDataUrl1 = await QRCode.toDataURL(
      JSON.stringify({ app: 'SMARTPARK', ticketId: ticketId1, token: qrToken1 }),
      { errorCorrectionLevel: 'H', margin: 2, width: 300 }
    );

    await ParkingTicket.create({
      ticketId: ticketId1,
      sessionId: session1._id,
      qrCode: qrDataUrl1,
      qrToken: qrToken1,
      customerName: customerUser.name,
      vehicleNumber: car1.vehicleNumber,
      vehicleType: car1.vehicleType,
      floorName: floor1.name,
      slotNumber: customerSlot.slotNumber,
      entryTime: entryTime1,
      expectedExit: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'active'
    });

    customerSlot.status = 'Occupied';
    customerSlot.currentSessionId = session1._id;
    await customerSlot.save();

    // Mark customer slot 2 as reserved
    customerSlot2.status = 'Reserved';
    await customerSlot2.save();

    // Mark 3 slots on Floor 3 under maintenance
    const maintenanceSlot1 = insertedSlots.find((s) => s.slotNumber === 'F3-C001');
    const maintenanceSlot2 = insertedSlots.find((s) => s.slotNumber === 'F3-C002');
    if (maintenanceSlot1) {
      maintenanceSlot1.status = 'Maintenance';
      await maintenanceSlot1.save();
    }
    if (maintenanceSlot2) {
      maintenanceSlot2.status = 'Maintenance';
      await maintenanceSlot2.save();
    }

    // Seed 15 additional occupied slots across floors to make charts and analytics look rich
    const randomSlotsToOccupy = insertedSlots
      .filter((s) => s.status === 'Available')
      .slice(10, 35);

    for (let i = 0; i < randomSlotsToOccupy.length; i++) {
      const slot = randomSlotsToOccupy[i];
      const hoursAgo = Math.floor(Math.random() * 5) + 1;
      const vTypes = ['Car', 'Bike', 'SUV', 'EV'];
      const vNum = `DL0${(i % 9) + 1}XY${1000 + i}`;
      const simTicketId = `SP-2026-${String(100100 + i)}`;

      const simSession = await ParkingSession.create({
        customerName: `Guest Driver #${i + 1}`,
        vehicleNumber: vNum,
        vehicleType: slot.vehicleType,
        slotId: slot._id,
        ticketId: simTicketId,
        entryTime: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        status: 'active',
        paymentStatus: 'pending'
      });

      slot.status = 'Occupied';
      slot.currentSessionId = simSession._id;
      await slot.save();
    }

    // Seed some historical completed sessions & payments (last 5 days) for analytics charts
    console.log('📈 Seeding historical revenue & parking analytics records...');
    for (let dayOffset = 5; dayOffset >= 1; dayOffset--) {
      for (let k = 0; k < 6; k++) {
        const histDate = new Date();
        histDate.setDate(histDate.getDate() - dayOffset);
        histDate.setHours(9 + k * 2, Math.floor(Math.random() * 50), 0);

        const durationMinutes = 60 + Math.floor(Math.random() * 180);
        const exitDate = new Date(histDate.getTime() + durationMinutes * 60 * 1000);
        const amount = 50 + Math.floor(Math.random() * 120);

        const histTicketId = `SP-2026-${String(900000 + dayOffset * 10 + k)}`;
        const histReceiptId = `RCPT-2026-${String(900000 + dayOffset * 10 + k)}`;
        const histTxnId = `TXN-${Date.now().toString(36).toUpperCase()}-${k}`;

        const completedSession = await ParkingSession.create({
          userId: customerUser._id,
          customerName: customerUser.name,
          vehicleNumber: `HR26AB${2000 + k}`,
          vehicleType: k % 2 === 0 ? 'Car' : 'Bike',
          slotId: customerSlot._id,
          ticketId: histTicketId,
          entryTime: histDate,
          exitTime: exitDate,
          duration: durationMinutes,
          status: 'completed',
          amount,
          paymentStatus: 'paid',
          createdAt: histDate
        });

        await Payment.create({
          sessionId: completedSession._id,
          userId: customerUser._id,
          ticketId: histTicketId,
          vehicleNumber: completedSession.vehicleNumber,
          amount,
          paymentMethod: ['UPI', 'Card', 'Cash'][k % 3],
          transactionId: histTxnId,
          receiptId: histReceiptId,
          status: 'success',
          paidAt: exitDate,
          createdAt: exitDate
        });
      }
    }

    // 7. Seed In-App Notifications
    console.log('🔔 Seeding Notifications...');
    await Notification.create([
      {
        userId: customerUser._id,
        role: 'customer',
        title: 'Vehicle Parked Successfully',
        message: 'Your vehicle DL01AB1234 has been parked at Slot F1-C001. Digital QR Ticket SP-2026-000123 generated.',
        type: 'success'
      },
      {
        role: 'all',
        title: 'Floor 3 EV Chargers Now Live',
        message: 'High-speed EV Charging is now operational on Floor 3 for electric vehicles.',
        type: 'info'
      },
      {
        role: 'staff',
        title: 'Peak Hour Alert',
        message: 'Floor 1 occupancy has exceeded 70%. Divert incoming 4-wheelers to Floor 2.',
        type: 'warning'
      }
    ]);

    console.log(`
    ========================================================================
     SMARTPARK DATABASE SEEDING COMPLETED SUCCESSFULLY!
    ========================================================================
    👤 DEMO CREDENTIALS:
       Admin:    admin@smartpark.com    / admin123
       Staff:    staff@smartpark.com    / staff123
       Customer: customer@smartpark.com / customer123
       Customer: priya@smartpark.com    / customer123

    🏢 PARKING STRUCTURE CREATED:
       Floor 1: 150 Slots (F1-C001 to F1-E150)
       Floor 2: 200 Slots (F2-C001 to F2-E200)
       Floor 3: 150 Slots (F3-C001 to F3-E150)
       TOTAL:   500 Slots with Car, Bike, SUV, and EV breakdown

    🎫 ACTIVE TICKET FOR DEMO:
       Ticket ID: SP-2026-000123 (Vehicle: DL01AB1234 at F1-C001)
    ========================================================================
    `);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
