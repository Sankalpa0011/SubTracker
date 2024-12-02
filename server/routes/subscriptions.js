import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription
} from '../controllers/subscriptions.js';

const router = express.Router();

// Validation middleware
const subscriptionValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('billingCycle').isIn(['monthly', 'yearly', 'quarterly', 'weekly'])
    .withMessage('Invalid billing cycle'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('category').trim().notEmpty().withMessage('Category is required')
];

// Routes
router.use(protect); // Protect all subscription routes

router.route('/')
  .get(getSubscriptions)
  .post(subscriptionValidation, createSubscription);

router.route('/:id')
  .get(getSubscription)
  .put(subscriptionValidation, updateSubscription)
  .delete(deleteSubscription);

export default router;