import { Router } from 'express';
import * as siteConfigController from '../controllers/site-config.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', siteConfigController.getConfig);
router.put('/', authenticate, requireAdmin, siteConfigController.updateConfig);

export default router;
