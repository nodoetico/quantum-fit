// Controlador de Membresía MyFit (Crystal) - Expone endpoints para el modelo espejo
// Cada socio vincula su cuenta MyFit y accede a sus datos reales (perfil, vencimientos, asistencias, saldo).
import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import {
  linkMyFitAccount,
  getMyFitLinkStatus,
  registerMyFitMember,
  logoutMyFitMember,
  forgotMyFitPassword,
  resetMyFitPassword,
  changeMyFitPassword,
  getMyFitProfile,
  getMyFitUserMemberships,
  getMyFitAttendances,
  getMyFitTransactions,
  getMyFitEnrollment,
  listMyFitMembershipPlans,
  contractMyFitMembership,
  updateMyFitProfile,
  updateMyFitEmergencyContact,
  MyFitError,
} from '../services/crystal-membership.service';

function handleError(res: Response, err: unknown, fallback: string): void {
  if (err instanceof MyFitError) {
    res.status(err.status).json({ success: false, error: err.message });
    return;
  }
  console.error('[MyFitController]', err instanceof Error ? err.message : 'Error');
  res.status(502).json({ success: false, error: fallback });
}

// ============================================================================
// VINCULACIÓN
// ============================================================================

/**
 * POST /api/crystal-membership/link
 * Vincula la cuenta MyFit del socio: valida credenciales y guarda el token de sesión cifrado.
 * Body: { email?, dni?, password } (al menos email o dni).
 */
export async function linkMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { email, dni, password } = req.body;
    if (!password || (!email && !dni)) {
      res.status(400).json({ success: false, error: 'email o dni (o ambos) y password son requeridos' });
      return;
    }
    const result = await linkMyFitAccount(req.userId!, { email, dni, password });
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo vincular la cuenta MyFit.');
  }
}

/**
 * GET /api/crystal-membership/status
 * Devuelve si el socio tiene su cuenta MyFit vinculada y su email.
 */
export async function myFitStatus(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const status = await getMyFitLinkStatus(req.userId!);
    res.json({ success: true, data: status });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo obtener el estado de vinculación.');
  }
}

/**
 * POST /api/crystal-membership/logout
 * Cierra la sesión del socio en MyFit y desvincula su cuenta.
 */
export async function logoutMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const result = await logoutMyFitMember(req.userId!);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo cerrar la sesión de MyFit.');
  }
}

// ============================================================================
// REGISTRO / PASSWORDS
// ============================================================================

/**
 * POST /api/crystal-membership/register
 * Crea la cuenta del socio en MyFit (name, dni, email?, phone?, password).
 */
export async function registerMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { name, dni, email, phone, password } = req.body;
    if (!name || !dni || !password) {
      res.status(400).json({ success: false, error: 'name, dni y password son requeridos' });
      return;
    }
    await registerMyFitMember({ name, dni, email, phone, password });
    res.json({ success: true, message: 'Cuenta creada en MyFit correctamente.' });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo crear la cuenta en MyFit.');
  }
}

/**
 * POST /api/crystal-membership/forgot-password
 * Solicita el restablecimiento de contraseña en MyFit. Body: { dni } o { email }.
 */
export async function forgotMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { dni, email } = req.body;
    await forgotMyFitPassword({ dni, email });
    res.json({ success: true, message: 'Si los datos son correctos, recibirás un correo para restablecer tu contraseña.' });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo solicitar el restablecimiento de contraseña.');
  }
}

/**
 * POST /api/crystal-membership/reset-password
 * Restablece la contraseña en MyFit. Body: { token, email, password, passwordConfirmation? }.
 */
export async function resetMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { token, email, password, passwordConfirmation } = req.body;
    if (!token || !email || !password) {
      res.status(400).json({ success: false, error: 'token, email y password son requeridos' });
      return;
    }
    await resetMyFitPassword({ token, email, password, passwordConfirmation });
    res.json({ success: true, message: 'Contraseña restablecida correctamente.' });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo restablecer la contraseña.');
  }
}

/**
 * POST /api/crystal-membership/change-password
 * Cambia la contraseña del socio en MyFit. Body: { currentPassword, password, passwordConfirmation? }.
 */
export async function changeMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { currentPassword, password, passwordConfirmation } = req.body;
    if (!currentPassword || !password) {
      res.status(400).json({ success: false, error: 'currentPassword y password son requeridos' });
      return;
    }
    await changeMyFitPassword(req.userId!, { currentPassword, password, passwordConfirmation });
    res.json({ success: true, message: 'Contraseña cambiada correctamente en MyFit.' });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo cambiar la contraseña.');
  }
}

// ============================================================================
// LECTURA DE DATOS REALES DEL SOCIO
// ============================================================================

/** GET /api/crystal-membership/profile - perfil real del socio en MyFit. */
export async function getMyFitProfileData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const profile = await getMyFitProfile(req.userId!);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo obtener el perfil de MyFit.');
  }
}

/** GET /api/crystal-membership/memberships - membresías reales (vencimientos, planes). */
export async function getMyFitUserMembershipsData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const memberships = await getMyFitUserMemberships(req.userId!);
    res.json({ success: true, data: memberships });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudieron obtener las membresías de MyFit.');
  }
}

/** GET /api/crystal-membership/attendances - asistencias reales del socio. */
export async function getMyFitAttendancesData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const attendances = await getMyFitAttendances(req.userId!);
    res.json({ success: true, data: attendances });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudieron obtener las asistencias de MyFit.');
  }
}

/** GET /api/crystal-membership/transactions - transacciones reales (saldo, créditos, deudas). */
export async function getMyFitTransactionsData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const transactions = await getMyFitTransactions(req.userId!);
    res.json({ success: true, data: transactions });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudieron obtener las transacciones de MyFit.');
  }
}

/** GET /api/crystal-membership/enrollment - estado de inscripción (vencimiento, renovación). */
export async function getMyFitEnrollmentData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const enrollment = await getMyFitEnrollment(req.userId!);
    res.json({ success: true, data: enrollment });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo obtener el estado de inscripción de MyFit.');
  }
}

// ============================================================================
// PLANES Y CONTRATACIÓN
// ============================================================================

/** GET /api/crystal-membership/plans - planes disponibles en MyFit. */
export async function listMyFitPlans(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const plans = await listMyFitMembershipPlans(req.userId!);
    res.json({ success: true, data: plans });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudieron obtener los planes disponibles.');
  }
}

/** POST /api/crystal-membership/contract - contrata una membresía en MyFit. Body: { membershipId, paymentMethodId, comments? }. */
export async function contractMyFit(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { membershipId, paymentMethodId, comments } = req.body;
    if (!membershipId || !paymentMethodId) {
      res.status(400).json({ success: false, error: 'membershipId y paymentMethodId son requeridos' });
      return;
    }
    const result = await contractMyFitMembership(req.userId!, { membershipId, paymentMethodId, comments });
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo contratar la membresía.');
  }
}

// ============================================================================
// ESCRITURA DE PERFIL / CONTACTO DE EMERGENCIA
// ============================================================================

/** PATCH /api/crystal-membership/profile - actualiza el perfil en MyFit. */
export async function updateMyFitProfileData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, dni, phone, gender, bloodType } = req.body;
    if (!name && !email && !dni && !phone && !gender && !bloodType) {
      res.status(400).json({ success: false, error: 'Al menos un campo es requerido' });
      return;
    }
    await updateMyFitProfile(req.userId!, { name, email, dni, phone, gender, bloodType });
    res.json({ success: true, message: 'Perfil actualizado en MyFit.' });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo actualizar el perfil.');
  }
}

/** PATCH /api/crystal-membership/emergency-contact - actualiza contacto de emergencia en MyFit. */
export async function updateMyFitEmergencyContactData(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { name, phone, email, relationship, address } = req.body;
    if (!name || !phone) {
      res.status(400).json({ success: false, error: 'name y phone son requeridos' });
      return;
    }
    await updateMyFitEmergencyContact(req.userId!, { name, phone, email, relationship, address });
    res.json({ success: true, message: 'Contacto de emergencia actualizado en MyFit.' });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo actualizar el contacto de emergencia.');
  }
}

// ============================================================================
// AYUDA PARA EL EXTERNAL-PULL LEGACY (por DNI)
// ============================================================================

/**
 * GET /api/crystal-membership/user-by-dni/:dni
 * Devuelve datos reales de un socio desde MyFit usando el token del usuario logueado,
 * validando que el DNI coincida. (Reemplaza la búsqueda global por DNI caída).
 */
export async function getMyFitUserByDni(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { dni } = req.params;
    if (!dni) {
      res.status(400).json({ success: false, error: 'DNI requerido' });
      return;
    }
    const profile = await getMyFitProfile(req.userId!);
    if (profile.dni && profile.dni !== dni) {
      res.status(403).json({ success: false, error: 'El DNI no coincide con tu cuenta vinculada.' });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    handleError(res, err, 'No se pudo obtener el usuario por DNI.');
  }
}
