import { Router } from 'express';
import * as c from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/summary', c.summary);
r.get('/export', c.exportCsv);
export default r;
