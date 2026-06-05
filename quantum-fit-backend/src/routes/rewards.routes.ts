// Rutas de Rewards
import { Router } from 'express';
import * as rewardsController from '../controllers/rewards.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/', rewardsController.getRewards);
router.get('/featured', rewardsController.getFeaturedRewards);
router.get('/categories', rewardsController.getCategories);
router.get('/:id', rewardsController.getRewardById);

// Rutas protegidas
router.post('/:id/redeem', authenticate, rewardsController.redeemReward);
router.get('/my-rewards', authenticate, rewardsController.getMyRedeemedRewards);

export default router;
