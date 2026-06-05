// Controlador de PULL - Consulta datos desde sistema externo (Crystal MiFit)
import { Request, Response } from 'express';
import { prisma } from '../database';
import {
  pullUserProfile,
  pullUserMemberships,
  pullUserAttendances,
  pullUserTransactions,
  syncMembershipsFromExternal,
  syncAttendancesFromExternal,
  testExternalConnection,
} from '../services/external-pull.service';

// ============================================================================
// CONSULTAS INDIVIDUALES (PULL)
// ============================================================================

/**
 * GET /api/external-pull/profile?dni=12345678
 * Obtiene perfil del usuario desde sistema externo
 */
export async function getExternalProfile(req: Request, res: Response): Promise<void> {
  const dni = typeof req.query.dni === 'string' ? req.query.dni : undefined;

  try {
    const profile = await pullUserProfile(dni);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'No se pudo obtener perfil del usuario',
      });
      return;
    }

    res.json({
      success: true,
      dni: dni || null,
      data: profile,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

/**
 * GET /api/external-pull/memberships?dni=12345678
 * Obtiene membresías desde sistema externo
 */
export async function getExternalMemberships(req: Request, res: Response): Promise<void> {
  const dni = typeof req.query.dni === 'string' ? req.query.dni : undefined;

  try {
    const memberships = await pullUserMemberships(dni);

    res.json({
      success: true,
      count: memberships.length,
      dni: dni || null,
      data: memberships,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

/**
 * GET /api/external-pull/attendances?dni=12345678&startDate=2026-01-01&endDate=2026-12-31
 * Obtiene asistencias desde sistema externo
 */
export async function getExternalAttendances(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const dni = typeof req.query.dni === 'string' ? req.query.dni : undefined;

  try {
    const attendances = await pullUserAttendances(
      typeof startDate === 'string' ? startDate : undefined,
      typeof endDate === 'string' ? endDate : undefined,
      dni
    );

    res.json({
      success: true,
      count: attendances.length,
      dni: dni || null,
      data: attendances,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

/**
 * GET /api/external-pull/transactions?dni=12345678&startDate=2026-01-01&endDate=2026-12-31
 * Obtiene transacciones desde sistema externo
 */
export async function getExternalTransactions(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const dni = typeof req.query.dni === 'string' ? req.query.dni : undefined;

  try {
    const transactions = await pullUserTransactions(
      typeof startDate === 'string' ? startDate : undefined,
      typeof endDate === 'string' ? endDate : undefined,
      dni
    );

    res.json({
      success: true,
      count: transactions.length,
      dni: dni || null,
      data: transactions,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ============================================================================
// SINCRONIZACIÓN (PULL + UPDATE LOCAL)
// ============================================================================

/**
 * POST /api/external-pull/sync/memberships
 * Sincroniza membresías desde sistema externo al local
 * Body: { userId: string }
 */
export async function syncMemberships(req: Request, res: Response): Promise<void> {
  const { userId, dni } = req.body;

  if (!userId && !dni) {
    res.status(400).json({
      success: false,
      error: 'userId o dni es requerido en el body',
    });
    return;
  }

  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (dni) {
      user = await prisma.user.findFirst({ where: { dni } });
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
      return;
    }

    const result = await syncMembershipsFromExternal(user, dni);

    res.json({
      success: true,
      message: `${result.synced} membresías sincronizadas`,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error en sincronización';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/external-pull/sync/attendances
 * Sincroniza asistencias desde sistema externo al local
 * Body: { userId: string, startDate?, endDate? }
 */
export async function syncAttendances(req: Request, res: Response): Promise<void> {
  const { userId, dni, startDate, endDate } = req.body;

  if (!userId && !dni) {
    res.status(400).json({
      success: false,
      error: 'userId o dni es requerido en el body',
    });
    return;
  }

  try {
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (dni) {
      user = await prisma.user.findFirst({ where: { dni } });
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
      return;
    }

    const result = await syncAttendancesFromExternal(
      user,
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined,
      dni
    );

    res.json({
      success: true,
      message: `${result.created} nuevas asistencias creadas de ${result.synced} total`,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error en sincronización';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * GET /api/external-pull/test
 * Prueba la conexión con el sistema externo
 */
export async function testConnection(_req: Request, res: Response): Promise<void> {
  const result = await testExternalConnection();
  res.json(result);
}

/**
 * GET /api/external-pull/all?dni=12345678
 * Obtiene toda la información del usuario (perfil, membresías, asistencias, transacciones)
 */
export async function getAllUserData(req: Request, res: Response): Promise<void> {
  const dni = typeof req.query.dni === 'string' ? req.query.dni : undefined;

  try {
    const [profile, memberships, attendances, transactions] = await Promise.all([
      pullUserProfile(dni),
      pullUserMemberships(dni),
      pullUserAttendances(undefined, undefined, dni),
      pullUserTransactions(undefined, undefined, dni),
    ]);

    res.json({
      success: true,
      dni: dni || null,
      data: {
        profile,
        memberships,
        attendances,
        transactions,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
