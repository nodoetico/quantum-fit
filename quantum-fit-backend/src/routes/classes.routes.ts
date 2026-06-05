import { Router } from 'express';
import * as classesController from '../controllers/classes.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, classesController.getAvailableClasses);
router.get('/:id', optionalAuth, classesController.getClassById);
router.post('/:id/book', authenticate, classesController.bookClass);

export default router;