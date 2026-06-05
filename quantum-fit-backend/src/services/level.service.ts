import { prisma } from '../database';

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2000,   // Level 3
  4000,   // Level 4
  6000,   // Level 5
  8000,   // Level 6
  10000,  // Level 7
  12000,  // Level 8
  14000,  // Level 9
  16000,  // Level 10
];

export function calculateLevel(totalPointsEarned: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPointsEarned >= LEVEL_THRESHOLDS[i]) {
      if (i === LEVEL_THRESHOLDS.length - 1) {
        return 10 + Math.floor((totalPointsEarned - LEVEL_THRESHOLDS[i]) / 2000);
      }
      return i + 1;
    }
  }
  return 1;
}

export function getLevelThresholds(level: number): { min: number; max: number } {
  if (level <= 1) return { min: 0, max: LEVEL_THRESHOLDS[1] };
  if (level >= LEVEL_THRESHOLDS.length) {
    const baseMin = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extraLevels = level - LEVEL_THRESHOLDS.length;
    return {
      min: baseMin + extraLevels * 2000,
      max: baseMin + (extraLevels + 1) * 2000,
    };
  }
  return {
    min: LEVEL_THRESHOLDS[level - 1],
    max: LEVEL_THRESHOLDS[level],
  };
}

export async function recalculateUserLevel(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, totalPointsEarned: true, level: true },
  });

  if (!user) return;

  const newLevel = calculateLevel(user.totalPointsEarned);
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }
}
