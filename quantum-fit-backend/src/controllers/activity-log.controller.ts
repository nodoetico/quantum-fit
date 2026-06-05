// Controlador de Activity Log
import { Request, Response } from 'express';
import * as activityLogService from '../services/activity-log.service';
import { AuthRequest } from '../types';

/**
 * GET /api/activity-log
 * Obtiene el historial de actividad del usuario autenticado
 */
export async function getActivityLog(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    const result = await activityLogService.getActivityLog({
      userId: req.userId,
      limit: limitNum,
      offset: offsetNum,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener actividad';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/activity-log/recent
 * Obtiene las últimas actividades (sin paginación)
 */
export async function getRecentActivity(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const logs = await activityLogService.getRecentActivity(req.userId, limitNum);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener actividad reciente';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}
