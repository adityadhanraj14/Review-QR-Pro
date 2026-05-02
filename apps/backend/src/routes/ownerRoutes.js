import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  listMyBusinesses,
  getQrPng,
  businessAnalytics,
  listBusinessFeedback,
} from '../controllers/ownerController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('owner'));

router.get('/businesses', listMyBusinesses);
router.get('/businesses/:id/qr', getQrPng);
router.get('/businesses/:id/analytics', businessAnalytics);
router.get('/businesses/:id/feedback', listBusinessFeedback);

export default router;
