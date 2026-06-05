// Rutas de Achievements
import { Router } from 'express';
import * as achievementsController from '../controllers/achievements.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/achievements - Todos los logros
router.get('/', achievementsController.getAllAchievements);

// GET /api/achievements/unlocked - Logros desbloqueados
router.get('/unlocked', achievementsController.getUnlockedAchievements);

// GET /api/achievements/recent - Logros recientes
router.get('/recent', achievementsController.getRecentAchievements);

// GET /api/achievements/:id/progress - Progreso de un logro específico
router.get('/:id/progress', achievementsController.getAchievementProgress);

// GET /api/achievements/:id - Logro específico por ID
router.get('/:id', achievementsController.getAchievementById);

export default router;
