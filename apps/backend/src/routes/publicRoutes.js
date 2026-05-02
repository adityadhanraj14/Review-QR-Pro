import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getBusinessPublic,
  generateReviews,
  logAnalytics,
  submitFeedback,
} from '../controllers/publicController.js';

const router = express.Router();

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests, try again soon' },
});

router.get('/r/:slug', getBusinessPublic);
router.post('/review/generate', generateLimiter, generateReviews);
router.post('/analytics/log', logAnalytics);
router.post('/feedback', submitFeedback);

export default router;
