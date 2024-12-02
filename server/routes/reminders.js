import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} from '../controllers/reminders.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

  router.put('/preferences', protect, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          'notificationPreferences': req.body 
        },
        { new: true }
      );
      res.json(user.notificationPreferences);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;