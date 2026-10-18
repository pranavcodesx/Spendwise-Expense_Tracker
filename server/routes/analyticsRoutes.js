import { Router } from 'express';
import * as c from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/summary', c.summary);
r.get('/spending-by-category', c.spendingByCategory);
r.get('/monthly-trends', c.monthlyTrends);
export default r;
