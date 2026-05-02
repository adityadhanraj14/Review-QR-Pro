import express from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

export default router;
