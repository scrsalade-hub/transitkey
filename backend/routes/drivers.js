import express from 'express';
import jwt from 'jsonwebtoken';
import Driver from '../models/Driver.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const generateAccessToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'TKD-';
  for (let i = 0; i < 12; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
};

const generateJWT = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

// Operator creates a driver (generates access token)
router.post('/create', authenticate, authorize('operator'), async (req, res) => {
  try {
    const { fullName, phoneNumber, email, plateNumber, busType, licenseNumber, licenseType, yearsOfExperience, vehicleClass } = req.body;
    const existing = await Driver.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) return res.status(400).json({ message: 'Email or phone number already registered' });
    let accessToken = generateAccessToken();
    let exists = await Driver.findOne({ accessToken });
    while (exists) { accessToken = generateAccessToken(); exists = await Driver.findOne({ accessToken }); }
    const driver = await Driver.create({
      operatorId: req.user.userId,
      fullName, phoneNumber, email, plateNumber, busType, licenseNumber, licenseType, yearsOfExperience, vehicleClass,
      accessToken
    });
    res.status(201).json({
      message: 'Driver created successfully',
      accessToken: driver.accessToken,
      driver: { _id: driver._id, fullName: driver.fullName, driverId: driver.driverId, phoneNumber: driver.phoneNumber, email: driver.email, plateNumber: driver.plateNumber, busType: driver.busType, accessToken: driver.accessToken }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Driver verifies access token and gets auto-logged in
router.post('/verify-token', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ message: 'Access token is required' });
    const driver = await Driver.findOne({ accessToken }).populate('assignedBus').populate('assignedRoute');
    if (!driver) return res.status(404).json({ message: 'Invalid access token' });
    const token = generateJWT(driver._id, 'driver');
    res.json({
      token,
      user: {
        _id: driver._id, fullName: driver.fullName, email: driver.email, phoneNumber: driver.phoneNumber,
        driverId: driver.driverId, status: driver.status, standing: driver.standing,
        plateNumber: driver.plateNumber, busType: driver.busType, licenseNumber: driver.licenseNumber,
        assignedBus: driver.assignedBus, assignedRoute: driver.assignedRoute,
        performance: driver.performance, role: 'driver'
      }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get my assigned tasks/trips (for logged-in driver)
router.get('/my-tasks', authenticate, authorize('driver'), async (req, res) => {
  try {
    const Trip = (await import('../models/Trip.js')).default;
    const trips = await Trip.find({ driver: req.user.userId })
      .populate('route', 'name startTerminal endTerminal fare distance estimatedDuration stops')
      .populate('bus', 'plateNumber model type')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ trips });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// List all drivers (operator only)
router.get('/', authenticate, authorize('operator'), async (req, res) => {
  try {
    const { search, status, experience, vehicleClass, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (vehicleClass) filter.vehicleClass = vehicleClass;
    if (experience) filter.yearsOfExperience = { $gte: parseInt(experience) };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { driverId: { $regex: search, $options: 'i' } }
      ];
    }
    const drivers = await Driver.find(filter)
      .populate('assignedBus', 'plateNumber model busId')
      .populate('assignedRoute', 'name startTerminal endTerminal')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Driver.countDocuments(filter);
    res.json({ drivers, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedBus');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver
router.put('/:id', authenticate, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver status
router.put('/:id/status', authenticate, authorize('operator'), async (req, res) => {
  try {
    const { status, standing } = req.body;
    const driver = await Driver.findByIdAndUpdate(req.params.id, { status, standing }, { new: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign driver to bus
router.put('/:id/assign-bus', authenticate, authorize('operator'), async (req, res) => {
  try {
    const { busId, plateNumber, vehicleClass } = req.body;
    const driver = await Driver.findByIdAndUpdate(req.params.id, { assignedBus: busId, plateNumber, vehicleClass }, { new: true }).populate('assignedBus');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver performance
router.get('/:id/performance', authenticate, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('performance');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver.performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
