import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Operator from '../models/Operator.js';

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Passenger Register
router.post('/passenger/register', async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) return res.status(400).json({ message: 'Email or phone number already registered' });
    const user = await User.create({ fullName, phoneNumber, email, password });
    const token = generateToken(user._id, 'passenger');
    res.status(201).json({ token, user: { _id: user._id, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: 'passenger' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Passenger Login
router.post('/passenger/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(user._id, 'passenger');
    res.json({ token, user: { _id: user._id, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: 'passenger' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Driver Login
router.post('/driver/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ $or: [{ email }, { phoneNumber: email }] });
    if (!driver) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await driver.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(driver._id, 'driver');
    res.json({ token, user: { _id: driver._id, fullName: driver.fullName, email: driver.email, phoneNumber: driver.phoneNumber, driverId: driver.driverId, status: driver.status, role: 'driver' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Driver Verify Code
router.post('/driver/verify-code', async (req, res) => {
  try {
    const { operatorCode } = req.body;
    const driver = await Driver.findOne({ operatorCode });
    if (!driver) return res.status(400).json({ message: 'Invalid operator code' });
    const token = generateToken(driver._id, 'driver');
    res.json({ token, user: { _id: driver._id, fullName: driver.fullName, email: driver.email, driverId: driver.driverId, role: 'driver' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Operator Register
router.post('/operator/register', async (req, res) => {
  try {
    const { companyName, phoneNumber, email, password } = req.body;
    const existing = await Operator.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) return res.status(400).json({ message: 'Email or phone number already registered' });
    const operator = await Operator.create({ companyName, phoneNumber, email, password });
    const token = generateToken(operator._id, 'operator');
    res.status(201).json({ token, user: { _id: operator._id, companyName: operator.companyName, email: operator.email, phoneNumber: operator.phoneNumber, operatorId: operator.operatorId, role: 'operator' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Operator Login
router.post('/operator/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const operator = await Operator.findOne({ email });
    if (!operator) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await operator.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(operator._id, 'operator');
    res.json({ token, user: { _id: operator._id, companyName: operator.companyName, email: operator.email, phoneNumber: operator.phoneNumber, operatorId: operator.operatorId, role: 'operator' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;
    if (decoded.role === 'passenger') user = await User.findById(decoded.userId).select('-password');
    else if (decoded.role === 'driver') user = await Driver.findById(decoded.userId).select('-password').populate('assignedBus');
    else if (decoded.role === 'operator') user = await Operator.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { ...user.toObject(), role: decoded.role } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
