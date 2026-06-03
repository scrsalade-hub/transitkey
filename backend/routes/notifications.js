import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, isRead } = req.query;
    const modelMap = { passenger: 'User', driver: 'Driver', operator: 'Operator' };
    const filter = {
      recipient: req.user.userId,
      recipientModel: modelMap[req.user.role]
    };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create notification (operator)
router.post('/', authenticate, async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const modelMap = { passenger: 'User', driver: 'Driver', operator: 'Operator' };
    await Notification.updateMany(
      { recipient: req.user.userId, recipientModel: modelMap[req.user.role], isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
