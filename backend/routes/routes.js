import express from 'express';
import Route from '../models/Route.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List all routes (public)
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const routes = await Route.find(filter).sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create route (operator)
router.post('/', authenticate, async (req, res) => {
  try {
    const routeCount = await Route.countDocuments();
    const routeId = `RTE-${String(routeCount + 1).padStart(4, '0')}`;
    const route = await Route.create({ ...req.body, routeId, createdBy: req.user.userId });
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update route
router.put('/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete (deactivate) route
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
