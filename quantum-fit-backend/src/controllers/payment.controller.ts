// Controlador de Pagos - Maneja las solicitudes HTTP del módulo de pagos
// Expone endpoints para que la app móvil y el admin web interactúen
// con el sistema de pagos a través de Crystal MiFit API.
import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import {
  getPaymentMethods,
  getEnrollmentStatus,
  renewEnrollment,
  renewMembership,
  getTransactions,
  syncSubscriptionLocally,
  getLocalSubscription,
  getLocalPaymentHistory,
} from '../services/payment.service';

// ============================================================================
// MÉTODOS DE PAGO
// ============================================================================

/**
 * GET /api/payments/methods
 * Devuelve los métodos de pago disponibles en el gimnasio (Efectivo, Tarjeta, etc.)
 * Estos métodos están configurados en el sistema de Crystal.
 */
export async function listPaymentMethods(_req: Request, res: Response): Promise<void> {
  try {
    const methods = await getPaymentMethods();

    res.json({
      success: true,
      data: methods,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener métodos de pago';
    res.status(502).json({
      success: false,
      error: message,
    });
  }
}

// ============================================================================
// INSCRIPCIÓN (ENROLLMENT)
// ============================================================================

/**
 * GET /api/payments/enrollment
 * Obtiene el estado actual de la inscripción del usuario en Crystal.
 * Incluye si está al día, vencimiento, precio de renovación, etc.
 */
export async function checkEnrollmentStatus(_req: Request, res: Response): Promise<void> {
  try {
    const enrollment = await getEnrollmentStatus();

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al consultar estado de inscripción';
    res.status(502).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/payments/enrollment/renew
 * Procesa el pago de una inscripción a través de Crystal.
 * Recibe el ID del método de pago y procesa la transacción.
 * Luego sincroniza el resultado en nuestra base de datos local.
 * 
 * Body: { paymentMethodId: number, comments?: string }
 */
export async function processEnrollmentRenewal(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { paymentMethodId, comments } = req.body;
    const userId = req.userId;

    if (!paymentMethodId) {
      res.status(400).json({
        success: false,
        error: 'El ID del método de pago es requerido',
      });
      return;
    }

    if (typeof paymentMethodId !== 'number') {
      res.status(400).json({
        success: false,
        error: 'El ID del método de pago debe ser un número',
      });
      return;
    }

    const result = await renewEnrollment(paymentMethodId, comments);

    // Sincronizar en nuestra base de datos local
    const endDate = new Date(result.enrollment.due_date);
    const renewalPrice = result.enrollment.last_payment_date
      ? 0 // Si ya pagó antes, es renovación (el precio viene de Crystal)
      : 0; // Lo obtendremos del estado de inscripción

    // Intentar sincronizar la suscripción local
    try {
      // Determinar el tipo de suscripción basado en la fecha de vencimiento
      const now = new Date();
      const monthsDiff = (endDate.getFullYear() - now.getFullYear()) * 12
        + (endDate.getMonth() - now.getMonth());

      let subType: 'VIP_MONTHLY' | 'VIP_QUARTERLY' | 'VIP_ANNUAL' = 'VIP_MONTHLY';
      if (monthsDiff >= 12) subType = 'VIP_ANNUAL';
      else if (monthsDiff >= 3) subType = 'VIP_QUARTERLY';

      await syncSubscriptionLocally(
        userId!,
        subType,
        endDate,
        renewalPrice,
        undefined
      );
    } catch (syncError: unknown) {
      // No interrumpimos el flujo, el pago ya se procesó en Crystal
    }

    res.json({
      success: true,
      message: result.message || 'Inscripción procesada correctamente',
      data: {
        enrollment: result.enrollment,
        isVip: true,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al procesar el pago';
    res.status(502).json({
      success: false,
      error: message,
    });
  }
}

// ============================================================================
// MEMBRESÍAS
// ============================================================================

/**
 * POST /api/payments/memberships/renew
 * Renueva una membresía específica a través de Crystal.
 * 
 * Body: { membershipId: number, paymentMethodId: number, comments?: string }
 */
export async function processMembershipRenewal(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { membershipId, paymentMethodId, comments } = req.body;
    const userId = req.userId;

    if (!membershipId || !paymentMethodId) {
      res.status(400).json({
        success: false,
        error: 'membershipId y paymentMethodId son requeridos',
      });
      return;
    }

    const result = await renewMembership(membershipId, paymentMethodId, comments);

    // Sincronizar en nuestra base de datos local
    if (result.membership) {
      const endDate = new Date(result.membership.end_date);

      try {
        await syncSubscriptionLocally(
          userId!,
          'VIP_MONTHLY',
          endDate,
          0,
          undefined
        );
      } catch {
      }
    }

    res.json({
      success: true,
      message: result.message || 'Membresía renovada correctamente',
      data: {
        membership: result.membership,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al renovar la membresía';
    res.status(502).json({
      success: false,
      error: message,
    });
  }
}

// ============================================================================
// TRANSACCIONES
// ============================================================================

/**
 * GET /api/payments/transactions
 * Obtiene el historial de transacciones del usuario desde Crystal.
 * Query params: perPage (opcional, default: 15)
 */
export async function listTransactions(req: Request, res: Response): Promise<void> {
  try {
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 15;
    const transactions = await getTransactions(perPage);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener transacciones';
    res.status(502).json({
      success: false,
      error: message,
    });
  }
}

// ============================================================================
// SUSCRIPCIÓN LOCAL
// ============================================================================

/**
 * GET /api/payments/subscription
 * Obtiene el estado de la suscripción del usuario desde nuestra base de datos local.
 * No requiere llamar a Crystal, usa los datos sincronizados previamente.
 */
export async function getMySubscription(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const subscription = await getLocalSubscription(userId!);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (_error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de la suscripción',
    });
  }
}

/**
 * GET /api/payments/history
 * Obtiene el historial de pagos del usuario desde nuestra base de datos local.
 */
export async function getMyPaymentHistory(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const payments = await getLocalPaymentHistory(userId!);

    res.json({
      success: true,
      data: payments,
    });
  } catch (_error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial de pagos',
    });
  }
}
