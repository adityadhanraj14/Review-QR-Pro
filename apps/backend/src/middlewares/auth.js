import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.token && req.cookies.token !== 'none') {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized', 401));
    }

    if (!config.jwtSecret) {
      return next(new AppError('Server misconfiguration', 500));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Session expired', 401));
      }
      return next(new AppError('Invalid token', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    if (!user.isActive) {
      return next(new AppError('Account deactivated', 401));
    }

    req.user = user;
    next();
  } catch {
    next(new AppError('Not authorized', 401));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403));
  }
  next();
};
