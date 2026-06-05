// Controlador de Achievements
import { Request, Response } from 'express';
import * as achievementsService from '../services/achievements.service';
import { AuthRequest } from '../types';

/**
 * GET /api/achievements
 * Obtiene todos los logros del usuario autenticado
 */
export async function getAllAchievements(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const result = await achievementsService.getAllAchievements(req.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener logros';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/achievements/unlocked
 * Obtiene solo los logros desbloqueados
 */
export async function getUnlockedAchievements(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const achievements = await achievementsService.getUnlockedAchievements(req.userId);

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener logros desbloqueados';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/achievements/recent
 * Obtiene los logros recientes
 */
export async function getRecentAchievements(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const achievements = await achievementsService.getRecentAchievements(req.userId, limitNum);

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener logros recientes';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/achievements/:id
 * Obtiene un logro específico por ID
 */
export async function getAchievementById(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { id } = req.params;
    const achievement = await achievementsService.getAchievementById(id, req.userId);

    res.status(200).json({
      success: true,
      data: achievement,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener logro';

    if (message.includes('no encontrado')) {
      res.status(404).json({
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
 * GET /api/achievements/:id/progress
 * Obtiene el progreso de un logro específico
 */
export async function getAchievementProgress(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { id } = req.params;
    const progress = await achievementsService.getAchievementProgress(req.userId, id);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener progreso del logro';

    if (message.includes('no encontrado')) {
      res.status(404).json({
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
