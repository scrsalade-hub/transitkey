import express from 'express';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Complaint from '../models/Complaint.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticate, authorize('operator'), async (req, res) => {
  try {
    const activeDrivers = await Driver.countDocuments({ status: 'active' });
    const totalTrips = await Trip.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'in_review'] } });
    const highPriorityComplaints = await Complaint.countDocuments({ urgency: 'critical', status: { $in: ['open', 'in_review'] } });
    res.json({ activeDrivers, totalTrips, pendingComplaints, highPriorityComplaints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all drivers managed by operator
router.get('/drivers', authenticate, authorize('operator'), async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedBus');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
