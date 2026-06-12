// Servicio de Rewards
import { prisma } from '../database';
import { notifyUser } from './notification.service';

/**
 * Obtiene todos los rewards activos
 */
export async function getAllRewards(category?: string) {
  const where: Record<string, unknown> = { isActive: true };
  
  if (category && category !== 'TODOS') {
    where.category = category;
  }

  return await prisma.reward.findMany({
    where,
    orderBy: { pointsCost: 'asc' },
  });
}

/**
 * Obtiene un reward por ID
 */
export async function getRewardById(rewardId: string) {
  return await prisma.reward.findUnique({
    where: { id: rewardId },
  });
}

/**
 * Obtiene rewards destacados
 */
export async function getFeaturedRewards() {
  return await prisma.reward.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    orderBy: { pointsCost: 'asc' },
  });
}

/**
 * Obtiene las categorías de rewards disponibles
 */
export async function getRewardCategories() {
  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  });

  return rewards.map(r => r.category);
}

/**
 * Canjea un reward
 */
export async function redeemReward(userId: string, rewardId: string) {
  // Obtener reward
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
  });

  if (!reward) {
    throw new Error('Reward no encontrado');
  }

  if (!reward.isActive) {
    throw new Error('Reward no está disponible');
  }

  if (reward.stockAvailable <= 0) {
    throw new Error('Sin stock disponible');
  }

  // Obtener usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.points < reward.pointsCost) {
    throw new Error('Puntos insuficientes');
  }

  // Generar código de retiro único
  const crypto = await import('crypto');
  const pickupCode = `QF-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // Crear transacción
  const redeemedReward = await prisma.redeemedReward.create({
    data: {
      userId,
      rewardId,
      status: 'PENDING',
      pointsSpent: reward.pointsCost,
      pickupCode,
    },
  });

  // Actualizar usuario (restar puntos)
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: user.points - reward.pointsCost,
    },
  });

  // Actualizar stock
  await prisma.reward.update({
    where: { id: rewardId },
    data: {
      stockAvailable: reward.stockAvailable - 1,
    },
  });

  const newBalance = user.points - reward.pointsCost;

  // Registrar en activity log
  await prisma.activityLog.create({
    data: {
      userId,
      activityType: 'REWARD_REDEEMED',
      points: -reward.pointsCost,
      pointsBalanceAfter: newBalance,
      title: `🎁 ${reward.name}`,
      description: `Canjeaste ${reward.name} por ${reward.pointsCost} puntos`,
      referenceId: redeemedReward.id,
      referenceType: 'redeemed_reward',
    },
  });

  notifyUser(userId, 'points-updated', {
    userId,
    newBalance,
    earned: -reward.pointsCost,
  });

  return redeemedReward;
}

/**
 * Admin: crea un canje manual para cualquier usuario
 */
export async function adminCreateRedemption(userId: string, rewardId: string, notes?: string) {
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) throw new Error('Reward no encontrado');
  if (!reward.isActive) throw new Error('Reward no está disponible');
  if (reward.stockAvailable <= 0) throw new Error('Sin stock disponible');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Usuario no encontrado');
  if (user.points < reward.pointsCost) throw new Error('Puntos insuficientes');

  const crypto = await import('crypto');
  const pickupCode = `QF-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const redeemedReward = await prisma.redeemedReward.create({
    data: {
      userId,
      rewardId,
      status: 'PENDING',
      pointsSpent: reward.pointsCost,
      pickupCode,
      notes: notes || null,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { points: user.points - reward.pointsCost },
  });

  await prisma.reward.update({
    where: { id: rewardId },
    data: { stockAvailable: reward.stockAvailable - 1 },
  });

  const newBalance = user.points - reward.pointsCost;

  await prisma.activityLog.create({
    data: {
      userId,
      activityType: 'REWARD_REDEEMED',
      points: -reward.pointsCost,
      pointsBalanceAfter: newBalance,
      title: `🎁 ${reward.name}`,
      description: `Canjeaste ${reward.name} por ${reward.pointsCost} puntos (admin)`,
      referenceId: redeemedReward.id,
      referenceType: 'redeemed_reward',
    },
  });

  notifyUser(userId, 'points-updated', { userId, newBalance, earned: -reward.pointsCost });

  return redeemedReward;
}

/**
 * Admin: elimina un canje y revierte puntos/stock
 */
export async function adminDeleteRedemption(redemptionId: string) {
  const redemption = await prisma.redeemedReward.findUnique({
    where: { id: redemptionId },
    include: { reward: true },
  });
  if (!redemption) throw new Error('Canje no encontrado');

  await prisma.$transaction([
    prisma.user.update({
      where: { id: redemption.userId },
      data: { points: { increment: redemption.pointsSpent } },
    }),
    prisma.reward.update({
      where: { id: redemption.rewardId },
      data: { stockAvailable: { increment: 1 } },
    }),
    prisma.activityLog.deleteMany({
      where: { referenceId: redemption.id, referenceType: 'redeemed_reward' },
    }),
    prisma.redeemedReward.delete({ where: { id: redemption.id } }),
  ]);

  notifyUser(redemption.userId, 'points-updated', {
    userId: redemption.userId,
    newBalance: (await prisma.user.findUnique({ where: { id: redemption.userId } }))?.points ?? 0,
    earned: redemption.pointsSpent,
  });

  return { message: 'Canje eliminado y puntos revertidos' };
}

/**
 * Obtiene los rewards canjeados por un usuario
 */
export async function getUserRedeemedRewards(userId: string) {
  return await prisma.redeemedReward.findMany({
    where: { userId },
    include: {
      reward: true,
    },
    orderBy: { redeemedAt: 'desc' },
  });
}
