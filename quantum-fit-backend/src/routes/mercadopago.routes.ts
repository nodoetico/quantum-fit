import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createMercadoPagoPreference,
  handleMercadoPagoWebhook,
  handleMercadoPagoRedirect,
  handleMercadoPagoManualApprove,
} from '../controllers/mercadopago.controller';

const router = Router();

router.post('/create-preference', authenticate, createMercadoPagoPreference);

router.post('/webhook', handleMercadoPagoWebhook);

router.get('/success', handleMercadoPagoRedirect);
router.get('/failure', handleMercadoPagoRedirect);
router.get('/pending', handleMercadoPagoRedirect);

// Endpoint para activación manual (demo/plan B)
router.post('/manual-approve', authenticate, handleMercadoPagoManualApprove);

export default router;
