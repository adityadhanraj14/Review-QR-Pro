import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const token = jwt.sign({ id: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge: config.cookieExpiry * 24 * 60 * 60 * 1000,
  };

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      data: { token, user: userObj },
    });
};

export const clearToken = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
};
