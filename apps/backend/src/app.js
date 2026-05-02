import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

if (config.isDev) {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/public', apiLimiter, publicRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

export default app;
