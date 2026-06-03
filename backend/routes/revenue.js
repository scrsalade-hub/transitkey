import express from 'express';
import Revenue from '../models/Revenue.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get revenue summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

    const dailyRevenue = await Revenue.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, expense: { $sum: '$expense' } } }
    ]);
    const weeklyRevenue = await Revenue.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, expense: { $sum: '$expense' } } }
    ]);
    const monthlyRevenue = await Revenue.aggregate([
      { $match: { date: { $gte: monthAgo } } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, expense: { $sum: '$expense' } } }
    ]);

    res.json({
      daily: dailyRevenue[0] || { revenue: 0, expense: 0 },
      weekly: weeklyRevenue[0] || { revenue: 0, expense: 0 },
      monthly: monthlyRevenue[0] || { revenue: 0, expense: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get revenue by route
router.get('/by-route', authenticate, async (req, res) => {
  try {
    const revenueByRoute = await Revenue.aggregate([
      { $group: { _id: '$route', totalRevenue: { $sum: '$amount' }, totalTrips: { $sum: 1 }, avgAmount: { $avg: '$amount' } } },
      { $lookup: { from: 'routes', localField: '_id', foreignField: '_id', as: 'route' } },
      { $unwind: '$route' },
      { $project: { routeName: '$route.name', totalRevenue: 1, totalTrips: 1, avgAmount: 1 } }
    ]);
    res.json(revenueByRoute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record revenue (operator)
router.post('/', authenticate, async (req, res) => {
  try {
    const revenue = await Revenue.create(req.body);
    res.status(201).json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
