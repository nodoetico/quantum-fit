import { Router } from 'express';
import * as bookingsController from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/my', bookingsController.getMyBookings);
router.put('/:id/cancel', bookingsController.cancelBooking);

export default router;