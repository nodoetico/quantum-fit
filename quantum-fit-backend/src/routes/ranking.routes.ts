import { Router } from 'express';
import * as rankingController from '../controllers/ranking.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, rankingController.getLeaderboard);

export default router;