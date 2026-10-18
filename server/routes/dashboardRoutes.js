import { Router } from 'express';
import * as c from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/summary', c.summary);
r.get('/charts', c.charts);
r.get('/recent-transactions', c.recent);
export default r;
