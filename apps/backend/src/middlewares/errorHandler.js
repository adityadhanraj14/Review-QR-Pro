import AppError from '../utils/AppError.js';
import { config } from '../config/index.js';

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const body = {
    success: false,
    message: err.message || 'Internal Server Error',
  };
  if (config.isDev && err.stack) {
    body.stack = err.stack;
  }
  if (!(err instanceof AppError) && statusCode === 500) {
    body.message = 'Internal Server Error';
  }
  res.status(statusCode).json(body);
};
