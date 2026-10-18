import { Router } from 'express';
import * as c from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const r = Router();
r.use(protect);
r.route('/profile').get(c.getProfile).patch(authLimiter, c.updateProfile);
r.patch('/password', authLimiter, c.updatePassword);
r.route('/demo-data').post(c.loadDemo).delete(c.removeDemo);
export default r;
