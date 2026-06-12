import { prisma } from '../database';
import { recalculateUserLevel } from './level.service';
import { notifyUser } from './notification.service';
import { getPointsForActivity } from './points-config.service';
import crypto from 'crypto';

export function generateReferralCode(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function assignReferralCode(userId: string, name: string) {
  let code = generateReferralCode(name);

  let existing = await prisma.user.findUnique({ where: { referralCode: code } });
  while (existing) {
    code = generateReferralCode(name);
    existing = await prisma.user.findUnique({ where: { referralCode: code } });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export async function processReferral(newUserId: string, referralCode: string) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
  });

  if (!referrer) {
    throw new Error('Código de referido inválido');
  }

  if (referrer.id === newUserId) {
    throw new Error('No puedes auto-referirte');
  }

  const newUser = await prisma.user.findUnique({ where: { id: newUserId } });
  if (!newUser) {
    throw new Error('Usuario no encontrado');
  }

  if (newUser.referredBy) {
    throw new Error('Ya fuiste referido por otro usuario');
  }

  await prisma.user.update({
    where: { id: newUserId },
    data: { referredBy: referrer.id },
  });

  const bonusPoints = await getPointsForActivity('REFERRAL_BONUS').catch(() => 150);

  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      points: referrer.points + bonusPoints,
      totalPointsEarned: referrer.totalPointsEarned + bonusPoints,
    },
  });

  await recalculateUserLevel(referrer.id);

  await prisma.activityLog.create({
    data: {
      userId: referrer.id,
      activityType: 'REFERRAL_BONUS',
      points: bonusPoints,
      pointsBalanceAfter: referrer.points + bonusPoints,
      title: 'Bono por Referido',
      description: `Ganaste ${bonusPoints} puntos por referir a ${newUser.name}`,
      referenceId: newUserId,
      referenceType: 'user',
    },
  });

  notifyUser(referrer.id, 'points-updated', {
    userId: referrer.id,
    newBalance: referrer.points + bonusPoints,
    earned: bonusPoints,
  });

  return { referrerId: referrer.id, bonusPoints };
}
