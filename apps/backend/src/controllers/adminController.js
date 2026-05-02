import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Analytics from '../models/Analytics.js';
import Feedback from '../models/Feedback.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { customAlphabet } from 'nanoid';
import {
  getActiveBusinessById,
  buildQrPayload,
  buildAnalyticsPayload,
  listFeedbackForBusiness,
} from '../services/businessMetricsService.js';

const slugAlphabet = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

function randomPassword() {
  return crypto.randomBytes(12).toString('base64url').slice(0, 16);
}

export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new AppError('name, email, password required', 400));
  }
  const emailNorm = String(email).toLowerCase().trim();
  if (!validator.isEmail(emailNorm)) {
    return next(new AppError('Invalid email', 400));
  }
  if (String(password).length < 8) {
    return next(new AppError('Password min 8 characters', 400));
  }
  const exists = await User.findOne({ email: emailNorm });
  if (exists) {
    return next(new AppError('Email already in use', 409));
  }
  const user = await User.create({
    name: String(name).trim(),
    email: emailNorm,
    password: String(password),
    role: 'admin',
  });
  const u = user.toObject();
  delete u.password;
  res.status(201).json({ success: true, data: { user: u } });
});

export const createOwner = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return next(new AppError('name and email required', 400));
  }
  const emailNorm = String(email).toLowerCase().trim();
  if (!validator.isEmail(emailNorm)) {
    return next(new AppError('Invalid email', 400));
  }
  const trimmedPassword = password != null ? String(password).trim() : '';
  if (trimmedPassword.length > 0 && trimmedPassword.length < 8) {
    return next(
      new AppError('Password must be at least 8 characters, or leave blank for an auto-generated password', 400)
    );
  }
  const plain = trimmedPassword.length >= 8 ? trimmedPassword : randomPassword();
  const usedGeneratedPassword = trimmedPassword.length < 8;

  const exists = await User.findOne({ email: emailNorm });
  if (exists) {
    return next(new AppError('Email already in use', 409));
  }
  const user = await User.create({
    name: String(name).trim(),
    email: emailNorm,
    password: plain,
    role: 'owner',
  });
  const u = user.toObject();
  delete u.password;
  res.status(201).json({
    success: true,
    message: usedGeneratedPassword ? 'Owner created — save this temporary password' : 'Owner created',
    data: {
      user: u,
      temporaryPassword: usedGeneratedPassword ? plain : undefined,
    },
  });
});

export const listOwners = asyncHandler(async (req, res) => {
  const owners = await User.find({ role: 'owner' }).sort({ createdAt: -1 }).select('-password');
  res.json({ success: true, data: { owners } });
});

export const createBusiness = asyncHandler(async (req, res, next) => {
  const { name, placeId, ownerId, location, serverName } = req.body;
  if (!name || !placeId || !ownerId) {
    return next(new AppError('name, placeId, ownerId required', 400));
  }
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== 'owner') {
    return next(new AppError('Invalid owner', 400));
  }
  let qrSlug = slugAlphabet();
  for (let i = 0; i < 5; i++) {
    const clash = await Business.findOne({ qrSlug });
    if (!clash) break;
    qrSlug = slugAlphabet();
  }
  const business = await Business.create({
    name: String(name).trim(),
    placeId: String(placeId).trim(),
    location: {
      address: location?.address ? String(location.address) : '',
      city: location?.city ? String(location.city) : '',
    },
    serverName: serverName ? String(serverName).trim() : '',
    ownerId,
    createdBy: req.user._id,
    qrSlug,
  });
  res.status(201).json({ success: true, data: { business } });
});

export const listBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find({ isActive: true })
    .populate('ownerId', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: { businesses } });
});

export const globalAnalytics = asyncHandler(async (req, res) => {
  const [scanCount, feedbackCount, businessCount] = await Promise.all([
    Analytics.countDocuments({ type: 'scan' }),
    Feedback.countDocuments(),
    Business.countDocuments({ isActive: true }),
  ]);
  const top = await Analytics.aggregate([
    { $match: { type: 'scan' } },
    { $group: { _id: '$businessId', scans: { $sum: 1 } } },
    { $sort: { scans: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'businesses',
        localField: '_id',
        foreignField: '_id',
        as: 'biz',
      },
    },
    { $unwind: '$biz' },
    { $project: { name: '$biz.name', scans: 1, qrSlug: '$biz.qrSlug' } },
  ]);
  res.json({
    success: true,
    data: {
      totals: { scans: scanCount, feedbackSubmissions: feedbackCount, businesses: businessCount },
      topBusinessesByScans: top,
    },
  });
});

export const adminBusinessQr = asyncHandler(async (req, res) => {
  const b = await getActiveBusinessById(req.params.id);
  const data = await buildQrPayload(b);
  res.json({ success: true, data });
});

export const adminBusinessAnalytics = asyncHandler(async (req, res) => {
  const b = await getActiveBusinessById(req.params.id);
  const data = await buildAnalyticsPayload(req.params.id, b.name);
  res.json({ success: true, data });
});

export const adminBusinessFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await getActiveBusinessById(id);
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const result = await listFeedbackForBusiness(id, page, limit);
  res.json({ success: true, data: result });
});

export const listAllFeedback = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.businessId && mongoose.isValidObjectId(req.query.businessId)) {
    filter.businessId = req.query.businessId;
  }
  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .populate('businessId', 'name qrSlug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(filter),
  ]);
  res.json({ success: true, data: { feedback: items, page, limit, total } });
});
