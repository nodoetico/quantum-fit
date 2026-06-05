// Rutas de Pagos - Endpoints para el módulo de pagos
// Todas las rutas requieren autenticación JWT del usuario.
// El flujo es: App -> Backend QuantumFit -> API Crystal (MiFit) -> Pago procesado
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listPaymentMethods,
  checkEnrollmentStatus,
  processEnrollmentRenewal,
  processMembershipRenewal,
  listTransactions,
  getMySubscription,
  getMyPaymentHistory,
} from '../controllers/payment.controller';

const router = Router();

// ============================================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================================================
router.use(authenticate);

// ============================================================================
// MÉTODOS DE PAGO
// ============================================================================

// GET /api/payments/methods
// Obtiene los métodos de pago disponibles en el gimnasio (configurados en Crystal)
router.get('/methods', listPaymentMethods);

// ============================================================================
// INSCRIPCIÓN (ENROLLMENT)
// ============================================================================

// GET /api/payments/enrollment
// Consulta el estado actual de la inscripción en Crystal
router.get('/enrollment', checkEnrollmentStatus);

// POST /api/payments/enrollment/renew
// Procesa el pago y renovación de inscripción a través de Crystal
// Body: { paymentMethodId: number, comments?: string }
router.post('/enrollment/renew', processEnrollmentRenewal);

// ============================================================================
// MEMBRESÍAS
// ============================================================================

// POST /api/payments/memberships/renew
// Renueva una membresía específica a través de Crystal
// Body: { membershipId: number, paymentMethodId: number, comments?: string }
router.post('/memberships/renew', processMembershipRenewal);

// ============================================================================
// TRANSACCIONES
// ============================================================================

// GET /api/payments/transactions?perPage=15
// Obtiene el historial de transacciones desde Crystal
router.get('/transactions', listTransactions);

// ============================================================================
// SUSCRIPCIÓN LOCAL (QuantumFit DB)
// ============================================================================

// GET /api/payments/subscription
// Obtiene la suscripción del usuario desde nuestra BD local
router.get('/subscription', getMySubscription);

// GET /api/payments/history
// Obtiene el historial de pagos desde nuestra BD local
router.get('/history', getMyPaymentHistory);

export default router;
