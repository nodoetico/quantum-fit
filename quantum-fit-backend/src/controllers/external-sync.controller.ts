// Controlador de Sincronización Externa
import { Request, Response } from 'express';
import * as externalSyncService from '../services/external-sync.service';
import { prisma } from '../database';
import { z } from 'zod';

const CheckInExternalSchema = z.object({
  dni: z.string().min(1, 'DNI es requerido'),
  timestamp: z.string().datetime({ message: 'Timestamp inválido (formato ISO 8601)' }),
  type: z.enum(['entry', 'exit']).optional().default('entry'),
  location: z.string().optional(),
});

const BatchCheckInSchema = z.object({
  checkins: z.array(CheckInExternalSchema).min(1).max(100),
});

/**
 * POST /api/external/checkin
 * Recibe un check-in del software del gimnasio
 */
export async function receiveCheckIn(req: Request, res: Response): Promise<void> {
  try {
    const validation = CheckInExternalSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.error.errors,
      });
      return;
    }

    const { dni, timestamp, type, location } = validation.data;
    const checkInDate = new Date(timestamp);

    const result = await externalSyncService.processExternalCheckIn({
      dni,
      checkInTime: checkInDate,
      type,
      location,
    });

    if (!result.success) {
      res.status(404).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        userId: result.userId,
        userName: result.userName,
        pointsEarned: result.pointsEarned,
        newBalance: result.newBalance,
        currentStreak: result.currentStreak,
        message: result.message,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

/**
 * POST /api/external/checkin/batch
 * Recibe múltiples check-ins en lote
 */
export async function receiveCheckInBatch(req: Request, res: Response): Promise<void> {
  try {
    const validation = BatchCheckInSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.error.errors,
      });
      return;
    }

    const { checkins } = validation.data;
    const transformedCheckins = checkins.map(c => ({
      dni: c.dni,
      checkInTime: new Date(c.timestamp),
      type: c.type,
      location: c.location,
    }));
    const results = await externalSyncService.processBatchCheckIns(transformedCheckins);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      data: {
        total: checkins.length,
        successful,
        failed,
        results,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

/**
 * GET /api/external/user/:dni
 * Busca un usuario por DNI (para verificar existencia antes de sync)
 */
export async function findUserByDni(req: Request, res: Response): Promise<void> {
  try {
    const { dni } = req.params;

    if (!dni || dni.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'DNI es requerido',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { dni: dni.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        points: true,
        level: true,
        currentStreak: true,
        isActive: true,
        memberSince: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `No se encontró usuario con DNI: ${dni}`,
        exists: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        exists: true,
        user,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

/**
 * POST /api/external/sync/status
 * Consulta el estado de sincronización
 */
export async function getSyncStatus(req: Request, res: Response): Promise<void> {
  try {
    const { dni, date } = req.body;

    if (!dni) {
      res.status(400).json({
        success: false,
        error: 'DNI es requerido',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { dni },
      select: {
        id: true,
        name: true,
        checkIns: {
          where: {
            checkInTime: date ? {
              gte: new Date(date),
              lt: new Date(new Date(date).getTime() + 86400000),
            } : undefined,
          },
          select: {
            id: true,
            checkInTime: true,
            checkOutTime: true,
            checkInType: true,
            pointsEarned: true,
            validationMethod: true,
          },
          orderBy: { checkInTime: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `No se encontró usuario con DNI: ${dni}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        userName: user.name,
        syncStatus: user.checkIns.length > 0 ? 'SYNCED' : 'NO_CHECKINS',
        checkIns: user.checkIns,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}
