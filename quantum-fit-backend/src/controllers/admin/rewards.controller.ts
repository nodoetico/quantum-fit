import { Request, Response } from 'express';
import { prisma } from '../../database';
import { RewardCategory } from '@prisma/client';
import { adminCreateRedemption, adminDeleteRedemption } from '../../services/rewards.service';

export async function getAllRewards(req: Request, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.reward.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        rewards,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener premios';
    res.status(500).json({ success: false, error: message });
  }
}

export async function getRewardById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const reward = await prisma.reward.findUnique({ where: { id } });

    if (!reward) {
      res.status(404).json({ success: false, error: 'Premio no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: reward });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener premio';
    res.status(500).json({ success: false, error: message });
  }
}

export async function createReward(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, pointsCost, category, stockTotal, imageUrl, isFeatured } = req.body;

    if (!name || !pointsCost || !category) {
      res.status(400).json({
        success: false,
        error: 'Nombre, pointsCost y category son requeridos',
      });
      return;
    }

    const validCategories = ['PRODUCTO', 'BEBIDA', 'DESCUENTO', 'PROMOCION'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        error: 'Categoría inválida. Válidas: PRODUCTO, BEBIDA, DESCUENTO, PROMOCION',
      });
      return;
    }

    const reward = await prisma.reward.create({
      data: {
        name,
        description: description || null,
        pointsCost: parseInt(pointsCost, 10),
        category: category as RewardCategory,
        stockTotal: parseInt(stockTotal || '0', 10),
        stockAvailable: parseInt(stockTotal || '0', 10),
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
      },
    });

    res.status(201).json({
      success: true,
      data: reward,
      message: 'Premio creado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear premio';
    res.status(500).json({ success: false, error: message });
  }
}

export async function updateReward(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'name', 'description', 'pointsCost', 'category',
      'stockTotal', 'stockAvailable', 'imageUrl', 'isActive', 'isFeatured',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const reward = await prisma.reward.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: reward,
      message: 'Premio actualizado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar premio';
    res.status(500).json({ success: false, error: message });
  }
}

export async function deleteReward(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const redemptions = await prisma.redeemedReward.count({ where: { rewardId: id } });
    if (redemptions > 0) {
      await prisma.reward.update({
        where: { id },
        data: { isActive: false },
      });
      res.status(200).json({
        success: true,
        message: 'Premio desactivado (tiene canjes asociados)',
      });
      return;
    }

    await prisma.reward.delete({ where: { id } });
    res.status(200).json({
      success: true,
      message: 'Premio eliminado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar premio';
    res.status(500).json({ success: false, error: message });
  }
}

export async function getRedemptions(req: Request, res: Response): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [redemptions, total] = await Promise.all([
      prisma.redeemedReward.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          reward: { select: { id: true, name: true, pointsCost: true } },
        },
        orderBy: { redeemedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.redeemedReward.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        redemptions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener canjes';
    res.status(500).json({ success: false, error: message });
  }
}

export async function createRedemption(req: Request, res: Response): Promise<void> {
  try {
    const { userId, rewardId, notes } = req.body;
    if (!userId || !rewardId) {
      res.status(400).json({ success: false, error: 'userId y rewardId son requeridos' });
      return;
    }
    const redemption = await adminCreateRedemption(userId, rewardId, notes);
    res.status(201).json({ success: true, data: redemption, message: 'Canje creado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear canje';
    res.status(500).json({ success: false, error: message });
  }
}

export async function deleteRedemption(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await adminDeleteRedemption(id);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar canje';
    res.status(500).json({ success: false, error: message });
  }
}

export async function updateRedemptionStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, error: 'El estado es requerido' });
      return;
    }

    const validStatuses = ['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Estado inválido' });
      return;
    }

    const updateData: Record<string, unknown> = { status };

    if (status === 'FULFILLED') {
      updateData.pickedUpAt = new Date();
    }

    if (status === 'APPROVED') {
      const redemption = await prisma.redeemedReward.findUnique({ where: { id } });
      if (redemption && !redemption.pickupDeadline) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
        updateData.pickupDeadline = deadline;
      }
    }

    const updated = await prisma.redeemedReward.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        reward: { select: { id: true, name: true, pointsCost: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Canje ${status === 'APPROVED' ? 'aprobado' : status === 'FULFILLED' ? 'completado' : status === 'CANCELLED' ? 'cancelado' : 'actualizado'} exitosamente`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar canje';
    res.status(500).json({ success: false, error: message });
  }
}
