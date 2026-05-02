import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendTokenResponse, clearToken } from '../utils/generateToken.js';

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and password required', 400));
  }
  const emailNorm = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: emailNorm }).select('+password');
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    return next(new AppError('Invalid credentials', 401));
  }
  if (!user.isActive) {
    return next(new AppError('Account deactivated', 401));
  }
  sendTokenResponse(user, 200, res, 'Login successful');
});

export const logout = asyncHandler(async (req, res) => {
  clearToken(res);
  res.status(200).json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: { user } });
});
