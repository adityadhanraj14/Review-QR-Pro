import Business from '../models/Business.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getActiveBusinessById,
  buildQrPayload,
  buildAnalyticsPayload,
  listFeedbackForBusiness,
} from '../services/businessMetricsService.js';

async function assertOwnerBusiness(user, businessId) {
  const b = await getActiveBusinessById(businessId);
  if (String(b.ownerId) !== String(user._id)) {
    throw new AppError('Forbidden', 403);
  }
  return b;
}

export const listMyBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find({ ownerId: req.user._id, isActive: true }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data: { businesses } });
});

export const getQrPng = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const b = await assertOwnerBusiness(req.user, id);
  const data = await buildQrPayload(b);
  res.json({ success: true, data });
});

export const businessAnalytics = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const bizMeta = await assertOwnerBusiness(req.user, id);
  const data = await buildAnalyticsPayload(id, bizMeta.name);
  res.json({ success: true, data });
});

export const listBusinessFeedback = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  await assertOwnerBusiness(req.user, id);
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const result = await listFeedbackForBusiness(id, page, limit);
  res.json({ success: true, data: result });
});
