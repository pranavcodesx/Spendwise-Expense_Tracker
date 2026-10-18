import { Router } from 'express';
import * as c from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.route('/').get(c.list).post(c.create);
r.route('/:id').patch(c.update).delete(c.remove);
export default r;
