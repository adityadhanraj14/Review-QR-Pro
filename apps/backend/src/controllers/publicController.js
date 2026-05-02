import Business from '../models/Business.js';
import Analytics from '../models/Analytics.js';
import Feedback from '../models/Feedback.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getOrCreateReviews } from '../services/reviewService.js';
import { AI_SUGGESTION_COUNT } from '../constants/aiReviews.js';

const allowedTypes = [
  'scan',
  'rating_selected',
  'ai_generate',
  'review_selected',
  'google_redirect',
  'internal_feedback',
];

async function businessBySlug(slug) {
  const b = await Business.findOne({ qrSlug: slug, isActive: true });
  if (!b) {
    throw new AppError('Not found', 404);
  }
  return b;
}

export const getBusinessPublic = asyncHandler(async (req, res, _next) => {
  const { slug } = req.params;
  const b = await businessBySlug(slug);
  res.json({
    success: true,
    data: {
      name: b.name,
      placeId: b.placeId,
      location: b.location,
      slug: b.qrSlug,
    },
  });
});

export const generateReviews = asyncHandler(async (req, res, next) => {
  const { slug, rating } = req.body;
  if (!slug) {
    return next(new AppError('slug required', 400));
  }
  const r = Number(rating);
  if (r !== 4 && r !== 5) {
    return next(new AppError('rating must be 4 or 5', 400));
  }
  const b = await businessBySlug(String(slug));
  let reviews;
  try {
    reviews = await getOrCreateReviews({ rating: r, business: b });
  } catch (e) {
    return next(new AppError(e.message || 'Generation failed', 400));
  }
  await Analytics.create({
    businessId: b._id,
    type: 'ai_generate',
    rating: r,
    sessionId: String(req.body.sessionId || '').slice(0, 64),
  });
  res.json({ success: true, data: { reviews } });
});

export const logAnalytics = asyncHandler(async (req, res, next) => {
  const { slug, type, rating, reviewIndex, sessionId, source } = req.body;
  if (!slug || !type) {
    return next(new AppError('slug and type required', 400));
  }
  if (!allowedTypes.includes(type)) {
    return next(new AppError('Invalid type', 400));
  }
  if (source != null && source !== '' && !['ai', 'custom'].includes(String(source))) {
    return next(new AppError('Invalid source', 400));
  }
  const b = await businessBySlug(String(slug));
  const rt = rating != null ? Number(rating) : undefined;
  if (rt != null && (rt < 1 || rt > 5 || Number.isNaN(rt))) {
    return next(new AppError('Invalid rating', 400));
  }
  if (reviewIndex != null && reviewIndex !== '') {
    const ri = Number(reviewIndex);
    if (Number.isNaN(ri) || ri < 0 || ri > AI_SUGGESTION_COUNT - 1) {
      return next(new AppError('Invalid reviewIndex', 400));
    }
  }
  const src = source && String(source) ? String(source) : undefined;
  const sid = String(sessionId || '').slice(0, 64);

  // Avoid double-counting scans from the same tab (e.g. React StrictMode or instant remount).
  // Do NOT block revisits: only skip if the same sessionId logged a scan for this business moments ago.
  if (type === 'scan' && sid) {
    const windowMs = 5000;
    const recent = await Analytics.findOne({
      businessId: b._id,
      type: 'scan',
      sessionId: sid,
      createdAt: { $gte: new Date(Date.now() - windowMs) },
    })
      .select('_id')
      .lean();
    if (recent) {
      res.status(200).json({ success: true, deduped: true });
      return;
    }
  }

  await Analytics.create({
    businessId: b._id,
    type,
    rating: rt,
    reviewIndex: reviewIndex != null && reviewIndex !== '' ? Number(reviewIndex) : undefined,
    source: src,
    sessionId: sid,
  });
  res.status(201).json({ success: true });
});

export const submitFeedback = asyncHandler(async (req, res, next) => {
  const { slug, rating, feedbackText, contact, sessionId } = req.body;
  if (!slug || !feedbackText) {
    return next(new AppError('slug and feedbackText required', 400));
  }
  const r = Number(rating);
  if (r < 1 || r > 5 || Number.isNaN(r)) {
    return next(new AppError('rating must be 1-5', 400));
  }
  if (r > 3) {
    return next(new AppError('Feedback path only for ratings 1-3', 400));
  }
  const b = await businessBySlug(String(slug));
  await Feedback.create({
    businessId: b._id,
    rating: r,
    feedbackText: String(feedbackText).trim(),
    contact: contact ? String(contact).trim() : '',
  });
  await Analytics.create({
    businessId: b._id,
    type: 'internal_feedback',
    rating: r,
    sessionId: String(sessionId || '').slice(0, 64),
  });
  res.status(201).json({ success: true, message: 'Thank you' });
});
