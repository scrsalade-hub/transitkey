import express from 'express';
import Expense from '../models/Expense.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get expenses (driver sees own, operator sees all)
router.get('/', authenticate, async (req, res) => {
  try {
    const { driver, status, expenseType, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (req.user.role === 'driver') {
      filter.driver = req.user.userId;
    } else if (driver) {
      filter.driver = driver;
    }
    if (status) filter.status = status;
    if (expenseType) filter.expenseType = expenseType;
    const expenses = await Expense.find(filter)
      .populate('driver', 'fullName driverId')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Expense.countDocuments(filter);
    res.json({ expenses, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit expense (driver)
router.post('/', authenticate, async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      driver: req.user.userId
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject expense (operator)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const expense = await Expense.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
