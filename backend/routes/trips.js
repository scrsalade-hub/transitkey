import express from 'express';
import Trip from '../models/Trip.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List trips
router.get('/', authenticate, async (req, res) => {
  try {
    const { driver, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (driver) filter.driver = driver;
    if (status) filter.status = status;
    const trips = await Trip.find(filter)
      .populate('route', 'name startTerminal endTerminal')
      .populate('driver', 'fullName driverId')
      .populate('bus', 'plateNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Trip.countDocuments(filter);
    res.json({ trips, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip (operator)
router.post('/', authenticate, async (req, res) => {
  try {
    const tripCount = await Trip.countDocuments();
    const tripId = `TRP-${String(tripCount + 1).padStart(4, '0')}`;
    const trip = await Trip.create({ ...req.body, tripId });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trip by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('route')
      .populate('driver', 'fullName driverId')
      .populate('bus');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, delayMinutes } = req.body;
    const update = { status };
    if (delayMinutes !== undefined) update.delayMinutes = delayMinutes;
    if (status === 'in_progress' && !update.startTime) update.startTime = new Date();
    if (status === 'completed') update.endTime = new Date();
    const trip = await Trip.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark arrival at stop
router.put('/:id/mark-arrival', authenticate, async (req, res) => {
  try {
    const { stopName, nextStop } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.completedStops.push(stopName);
    trip.currentStop = stopName;
    trip.nextStop = nextStop || '';
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
