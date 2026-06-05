// Controlador de Check-ins
import { Request, Response } from 'express';
import * as checkinsService from '../services/checkins.service';
import { AuthRequest } from '../types';

/**
 * POST /api/checkins
 * Crea un nuevo check-in
 */
export async function createCheckIn(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { type, validationMethod, gymLocation, notes } = req.body;

    // Validar campos requeridos
    if (!type || !validationMethod) {
      res.status(400).json({
        success: false,
        error: 'Tipo de check-in y método de validación son requeridos',
      });
      return;
    }

    // Validar tipo
    const validTypes = ['CLASS', 'OPEN_GYM', 'PERSONAL_TRAINER'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Tipo de check-in inválido',
      });
      return;
    }

    // Validar método de validación
    const validMethods = ['QR_SCAN', 'STAFF_VALIDATION', 'GEOFENCE'];
    if (!validMethods.includes(validationMethod)) {
      res.status(400).json({
        success: false,
        error: 'Método de validación inválido',
      });
      return;
    }

    // Crear check-in
    const result = await checkinsService.createCheckIn({
      userId: req.userId,
      checkInType: type,
      validationMethod,
      gymLocation,
      notes,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Check-in registrado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar check-in';
    
    if (message.includes('ya registraste')) {
      res.status(409).json({
        success: false,
        error: message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/checkins/my-checkins
 * Obtiene los check-ins del usuario autenticado
 */
export async function getMyCheckIns(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { from, to, limit = '50', offset = '0' } = req.query;

    const prisma = await import('../database').then(m => m.prisma);

    const where: Record<string, unknown> & { checkInTime?: { gte?: Date; lte?: Date } } = { userId: req.userId };

    if (from || to) {
      where.checkInTime = {};
      if (from) where.checkInTime.gte = new Date(from as string);
      if (to) where.checkInTime.lte = new Date(to as string);
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      orderBy: { checkInTime: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.checkIn.count({ where });

    res.status(200).json({
      success: true,
      data: {
        checkIns,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener check-ins';
    
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/checkins/stats
 * Obtiene estadísticas de check-ins del usuario
 */
export async function getCheckInStats(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const prisma = await import('../database').then(m => m.prisma);

    // Obtener usuario con estadísticas
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        totalWorkouts: true,
        totalClasses: true,
        lastCheckinDate: true,
      },
    });

    // Obtener check-ins de esta semana
    const today = new Date();
    const weekStart = getMonday(today);

    const weekCheckIns = await prisma.checkIn.count({
      where: {
        userId: req.userId,
        checkInTime: { gte: weekStart },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...user,
        weekCheckIns,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';
    
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * Helper: Obtiene el lunes de la semana
 */
function getMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}
