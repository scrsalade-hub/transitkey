import express from 'express';
import Bus from '../models/Bus.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List all buses
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const buses = await Bus.find(filter).populate('assignedDriver', 'fullName driverId');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create bus (operator)
router.post('/', authenticate, async (req, res) => {
  try {
    const busCount = await Bus.countDocuments();
    const busId = `BUS-${String(busCount + 1).padStart(3, '0')}`;
    const bus = await Bus.create({ ...req.body, busId });
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update bus
router.put('/:id', authenticate, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
