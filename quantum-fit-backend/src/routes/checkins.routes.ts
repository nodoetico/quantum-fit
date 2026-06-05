// Rutas de Check-ins
import { Router } from 'express';
import * as checkinsController from '../controllers/checkins.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post('/', checkinsController.createCheckIn);
router.get('/my-checkins', checkinsController.getMyCheckIns);
router.get('/stats', checkinsController.getCheckInStats);

export default router;
