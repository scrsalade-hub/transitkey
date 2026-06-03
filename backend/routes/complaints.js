import express from 'express';
import Complaint from '../models/Complaint.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List complaints
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, urgency, category, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (req.user.role === 'passenger') {
      filter.complainant = req.user.userId;
      filter.complainantType = 'passenger';
    } else if (req.user.role === 'driver') {
      filter.complainant = req.user.userId;
      filter.complainantType = 'driver';
    }
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (category) filter.category = category;
    const complaints = await Complaint.find(filter)
      .populate('complainant', 'fullName driverId')
      .populate('assignedTo', 'companyName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Complaint.countDocuments(filter);
    res.json({ complaints, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit complaint
router.post('/', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      complainant: req.user.userId,
      complainantType: req.user.role === 'driver' ? 'driver' : 'passenger'
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update complaint status (operator)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const update = { status };
    if (assignedTo) update.assignedTo = assignedTo;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
