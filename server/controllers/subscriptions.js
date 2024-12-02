import { validationResult } from 'express-validator';
import Subscription from '../models/Subscription.js';

// Get all subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single subscription
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create subscription
export const createSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const subscription = new Subscription({
      ...req.body,
      user: req.user._id,
      nextBillingDate: calculateNextBillingDate(req.body.startDate, req.body.billingCycle)
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        ...req.body,
        nextBillingDate: calculateNextBillingDate(req.body.startDate, req.body.billingCycle)
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete subscription
export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate next billing date
const calculateNextBillingDate = (startDate, billingCycle) => {
  const date = new Date(startDate);
  
  switch (billingCycle) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date;
};