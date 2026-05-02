import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, authorize } from '../middlewares/auth.js';
import {
  createAdmin,
  createOwner,
  listOwners,
  createBusiness,
  listBusinesses,
  globalAnalytics,
  listAllFeedback,
  adminBusinessQr,
  adminBusinessAnalytics,
  adminBusinessFeedback,
} from '../controllers/adminController.js';

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);
router.use(adminLimiter);
router.use(authorize('admin', 'superadmin'));

router.post('/admins', authorize('superadmin'), createAdmin);
router.post('/owners', createOwner);
router.get('/owners', listOwners);
router.post('/businesses', createBusiness);
router.get('/businesses', listBusinesses);
router.get('/businesses/:id/qr', adminBusinessQr);
router.get('/businesses/:id/analytics', adminBusinessAnalytics);
router.get('/businesses/:id/feedback', adminBusinessFeedback);
router.get('/analytics', globalAnalytics);
router.get('/feedback', listAllFeedback);

export default router;
