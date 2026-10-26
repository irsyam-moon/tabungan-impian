import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getUsers } from '../controllers/admin.controller';

const router = Router();
router.use(authenticate, authorize('ADMIN'));
router.get('/users', getUsers);

export default router;