// Rutas de Activity Log
import { Router } from 'express';
import * as activityLogController from '../controllers/activity-log.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/activity-log - Historial completo con paginación
router.get('/', activityLogController.getActivityLog);

// GET /api/activity-log/recent - Últimas actividades
router.get('/recent', activityLogController.getRecentActivity);

export default router;
