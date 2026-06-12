import { Router } from 'express';
import * as pointsConfigController from '../controllers/points-config.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, pointsConfigController.getAllConfigs);
router.post('/', authenticate, requireAdmin, pointsConfigController.upsertConfig);
router.post('/seed', authenticate, requireAdmin, pointsConfigController.seedDefaults);
router.put('/:id', authenticate, requireAdmin, pointsConfigController.upsertConfig);
router.delete('/:id', authenticate, requireAdmin, pointsConfigController.deleteConfig);

export default router;
