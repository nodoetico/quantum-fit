import { Router } from 'express';
import * as rewardsController from '../../controllers/admin/rewards.controller';
import { authenticate, requireStaff } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireStaff);

router.get('/', rewardsController.getAllRewards);
router.get('/redemptions', rewardsController.getRedemptions);
router.get('/:id', rewardsController.getRewardById);
router.post('/', rewardsController.createReward);
router.put('/:id', rewardsController.updateReward);
router.delete('/:id', rewardsController.deleteReward);
router.post('/redemptions', rewardsController.createRedemption);
router.delete('/redemptions/:id', rewardsController.deleteRedemption);
router.put('/redemptions/:id/status', rewardsController.updateRedemptionStatus);

export default router;
