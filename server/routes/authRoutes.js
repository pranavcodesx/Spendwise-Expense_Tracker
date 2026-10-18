import { Router } from 'express';
import * as c from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const r = Router();
r.post('/register', authLimiter, c.register);
r.post('/login', authLimiter, c.login);
r.post('/logout', c.logout);
r.get('/me', protect, c.me);
r.post('/forgot-password', authLimiter, c.forgotPassword);
r.post('/reset-password', authLimiter, c.resetPassword);
export default r;
