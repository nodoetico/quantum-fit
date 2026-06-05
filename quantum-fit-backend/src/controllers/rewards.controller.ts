// Controlador de Rewards
import { Request, Response } from 'express';
import * as rewardsService from '../services/rewards.service';
import { AuthRequest } from '../types';

/**
 * GET /api/rewards
 * Obtiene todos los rewards activos
 */
export async function getRewards(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { category } = req.query;
    const rewards = await rewardsService.getAllRewards(category as string);

    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener rewards';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/rewards/featured
 * Obtiene rewards destacados
 */
export async function getFeaturedRewards(_req: Request, res: Response): Promise<void> {
  try {
    const rewards = await rewardsService.getFeaturedRewards();

    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener rewards destacados';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/rewards/categories
 * Obtiene categorías disponibles
 */
export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await rewardsService.getRewardCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener categorías';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/rewards/:id
 * Obtiene un reward por ID
 */
export async function getRewardById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const reward = await rewardsService.getRewardById(id);

    if (!reward) {
      res.status(404).json({
        success: false,
        error: 'Reward no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: reward,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener reward';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/rewards/:id/redeem
 * Canjea un reward
 */
export async function redeemReward(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { id } = req.params;
    const result = await rewardsService.redeemReward(req.userId, id);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Reward canjeado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al canjear reward';

    if (message.includes('Puntos insuficientes')) {
      res.status(400).json({
        success: false,
        error: message,
      });
      return;
    }

    if (message.includes('Sin stock') || message.includes('no está disponible')) {
      res.status(400).json({
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
 * GET /api/rewards/my-rewards
 * Obtiene rewards canjeados por el usuario
 */
export async function getMyRedeemedRewards(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const rewards = await rewardsService.getUserRedeemedRewards(req.userId);

    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener rewards canjeados';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}
