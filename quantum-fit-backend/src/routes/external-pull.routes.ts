// Rutas de PULL - Consulta datos desde sistema externo (Crystal MiFit)
import { Router } from 'express';
import * as externalPullController from '../controllers/external-pull.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================================================
// CONSULTAS PULL (Requieren JWT del usuario autenticado)
// Estas rutas obtienen datos del MiFit API y los devuelven al usuario
// ============================================================================

// GET /api/external-pull/profile?dni=12345678
router.get('/profile', authenticate, externalPullController.getExternalProfile);

// GET /api/external-pull/memberships?dni=12345678
router.get('/memberships', authenticate, externalPullController.getExternalMemberships);

// GET /api/external-pull/attendances?dni=12345678&startDate=2026-01-01&endDate=2026-12-31
router.get('/attendances', authenticate, externalPullController.getExternalAttendances);

// GET /api/external-pull/transactions?dni=12345678&startDate=2026-01-01&endDate=2026-12-31
router.get('/transactions', authenticate, externalPullController.getExternalTransactions);

// ============================================================================
// SINCRONIZACIÓN PULL (Consulta externo + Actualiza local)
// ============================================================================

// POST /api/external-pull/sync/memberships
router.post('/sync/memberships', authenticate, externalPullController.syncMemberships);

// POST /api/external-pull/sync/attendances
router.post('/sync/attendances', authenticate, externalPullController.syncAttendances);

// ============================================================================
// UTILIDADES
// ============================================================================

// GET /api/external-pull/test
router.get('/test', authenticate, externalPullController.testConnection);

// GET /api/external-pull/all
router.get('/all', authenticate, externalPullController.getAllUserData);

export default router;
