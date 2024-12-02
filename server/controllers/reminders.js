import Reminder from '../models/Reminder.js';

// Get all reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id })
      .populate('subscription');
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const reminder = new Reminder({
      ...req.body,
      user: req.user._id
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};