// Rutas de Membresía MyFit (Crystal) - Modelo espejo por sesión del socio
// Todas requieren autenticación JWT del usuario de QuantumFit.
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  linkMyFit,
  myFitStatus,
  logoutMyFit,
  registerMyFit,
  forgotMyFit,
  resetMyFit,
  changeMyFit,
  getMyFitProfileData,
  getMyFitUserMembershipsData,
  getMyFitAttendancesData,
  getMyFitTransactionsData,
  getMyFitEnrollmentData,
  listMyFitPlans,
  contractMyFit,
  updateMyFitProfileData,
  updateMyFitEmergencyContactData,
  getMyFitUserByDni,
} from '../controllers/crystal-membership.controller';

const router = Router();

// ============================================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================================================
router.use(authenticate);

// ============================================================================
// VINCULACIÓN / SESIÓN
// ============================================================================
router.post('/link', linkMyFit);
router.get('/status', myFitStatus);
router.post('/logout', logoutMyFit);

// ============================================================================
// REGISTRO / PASSWORDS
// ============================================================================
router.post('/register', registerMyFit);
router.post('/forgot-password', forgotMyFit);
router.post('/reset-password', resetMyFit);
router.post('/change-password', changeMyFit);

// ============================================================================
// LECTURA DE DATOS REALES DEL SOCIO
// ============================================================================
router.get('/profile', getMyFitProfileData);
router.get('/memberships', getMyFitUserMembershipsData);
router.get('/attendances', getMyFitAttendancesData);
router.get('/transactions', getMyFitTransactionsData);
router.get('/enrollment', getMyFitEnrollmentData);
router.get('/user-by-dni/:dni', getMyFitUserByDni);

// ============================================================================
// PLANES Y CONTRATACIÓN
// ============================================================================
router.get('/plans', listMyFitPlans);
router.post('/contract', contractMyFit);

// ============================================================================
// ESCRITURA DE PERFIL / CONTACTO DE EMERGENCIA
// ============================================================================
router.patch('/profile', updateMyFitProfileData);
router.patch('/emergency-contact', updateMyFitEmergencyContactData);

export default router;
