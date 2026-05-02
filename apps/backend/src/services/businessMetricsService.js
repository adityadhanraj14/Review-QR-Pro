import mongoose from 'mongoose';
import QRCode from 'qrcode';
import Business from '../models/Business.js';
import Analytics from '../models/Analytics.js';
import Feedback from '../models/Feedback.js';
import AppError from '../utils/AppError.js';
import { config } from '../config/index.js';

export async function getActiveBusinessById(businessId) {
  const b = await Business.findOne({ _id: businessId, isActive: true });
  if (!b) {
    throw new AppError('Business not found', 404);
  }
  return b;
}

export async function buildQrPayload(b) {
  const targetUrl = `${config.publicAppUrl}/r/${b.qrSlug}`;
  const pngDataUrl = await QRCode.toDataURL(targetUrl, { margin: 2, width: 512 });
  return { pngDataUrl, targetUrl, qrSlug: b.qrSlug };
}

export async function buildAnalyticsPayload(bid, businessName) {
  const scans = await Analytics.countDocuments({ businessId: bid, type: 'scan' });
  const aiGen = await Analytics.countDocuments({ businessId: bid, type: 'ai_generate' });
  const googleGo = await Analytics.countDocuments({ businessId: bid, type: 'google_redirect' });
  const feedbackCount = await Feedback.countDocuments({ businessId: bid });

  const oid = new mongoose.Types.ObjectId(bid);
  const ratings = await Analytics.aggregate([
    { $match: { businessId: oid, type: 'rating_selected', rating: { $gte: 1, $lte: 5 } } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    dist[r._id] = r.count;
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const tz = config.analyticsTimezone;
  const daily = await Analytics.aggregate([
    {
      $match: {
        businessId: oid,
        type: 'scan',
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: tz,
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const rated = await Analytics.countDocuments({ businessId: bid, type: 'rating_selected' });
  const rawRatio = scans > 0 ? googleGo / scans : 0;
  const conversionRate = scans > 0 ? Math.min(100, Math.round(rawRatio * 1000) / 10) : 0;
  const opensPerScan = scans > 0 ? Math.round(rawRatio * 10) / 10 : null;

  const avgDoc = await Analytics.aggregate([
    { $match: { businessId: oid, type: 'rating_selected', rating: { $gte: 1, $lte: 5 } } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);
  const avgRating = avgDoc[0]?.avg != null ? Math.round(avgDoc[0].avg * 10) / 10 : null;

  return {
    businessName,
    totalScans: scans,
    reviewsGenerated: aiGen,
    googleRedirects: googleGo,
    feedbackSubmissions: feedbackCount,
    ratingsDistribution: dist,
    dailyScans: daily,
    conversionRate,
    opensPerScan,
    ratingsSelected: rated,
    avgRating,
  };
}

export async function listFeedbackForBusiness(businessId, page, limit) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Feedback.find({ businessId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments({ businessId }),
  ]);
  return { feedback: items, page, limit, total };
}
