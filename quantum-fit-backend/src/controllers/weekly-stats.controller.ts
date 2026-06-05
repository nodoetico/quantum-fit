// Controlador de Weekly Stats
import { Request, Response } from 'express';
import * as weeklyStatsService from '../services/weekly-stats.service';
import { AuthRequest } from '../types';

/**
 * GET /api/stats/weekly
 * Obtiene las estadísticas semanales del usuario autenticado
 */
export async function getWeeklyStats(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const stats = await weeklyStatsService.getWeeklyStats(req.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas semanales';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/stats/weekly/current
 * Obtiene el progreso de la semana actual
 */
export async function getCurrentWeekProgress(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const progress = await weeklyStatsService.getCurrentWeekProgress(req.userId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener progreso semanal';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}
