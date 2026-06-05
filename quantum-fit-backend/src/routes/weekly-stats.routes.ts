// Rutas de Weekly Stats
import { Router } from 'express';
import * as weeklyStatsController from '../controllers/weekly-stats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/stats/weekly - Estadísticas de las últimas 4 semanas
router.get('/', weeklyStatsController.getWeeklyStats);

// GET /api/stats/weekly/current - Progreso de la semana actual
router.get('/current', weeklyStatsController.getCurrentWeekProgress);

export default router;
