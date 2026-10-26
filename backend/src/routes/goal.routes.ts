import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { addSaving, createGoal, deleteGoal, getGoals, updateGoal } from '../controllers/goal.controller';

const router = Router();
router.use(authenticate);

router.get('/', getGoals);
router.post('/', upload.single('image'), createGoal);
router.put('/:id', upload.single('image'), updateGoal);
router.post('/:id/savings', addSaving);
router.delete('/:id', deleteGoal);

export default router;