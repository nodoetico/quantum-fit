// Rutas de Integración Externa (para conectar con software del gimnasio)
import { Router } from 'express';
import * as externalController from '../controllers/external-sync.controller';
import { authenticateIntegration } from '../middleware/integration-auth';

const router = Router();

// ============================================================================
// ENDPOINTS PARA EL SOFTWARE DEL GIMNASIO
// Todos protegidos con API Key
// ============================================================================

// POST /api/external/checkin - Recibe check-in del software externo
router.post('/checkin', authenticateIntegration, externalController.receiveCheckIn);

// POST /api/external/checkin/batch - Recibe múltiples check-ins (batch)
router.post('/checkin/batch', authenticateIntegration, externalController.receiveCheckInBatch);

// GET /api/external/user/:dni - Busca usuario por DNI (para verificar existencia)
router.get('/user/:dni', authenticateIntegration, externalController.findUserByDni);

// POST /api/external/sync/status - Consulta estado de sincronización
router.post('/sync/status', authenticateIntegration, externalController.getSyncStatus);

export default router;
