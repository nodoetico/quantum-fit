import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as referralController from '../controllers/referral.controller';

const router = Router();

router.get('/code', authenticate, referralController.getMyReferralCode);
router.get('/referrals', authenticate, referralController.getMyReferrals);

export default router;
