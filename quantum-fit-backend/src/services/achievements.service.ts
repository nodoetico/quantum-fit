// Servicio de Achievements
import { prisma } from '../database';

/**
 * Obtiene todos los logros del usuario (desbloqueados y pendientes)
 */
export async function getAllAchievements(userId: string) {
  // Obtener todos los logros activos
  const allAchievements = await prisma.achievement.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  // Obtener logros desbloqueados por el usuario
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  // Crear un mapa de logros desbloqueados
  const unlockedMap = new Map(
    userAchievements.map((ua) => [
      ua.achievementId,
      {
        unlockedAt: ua.unlockedAt,
        currentProgress: ua.currentProgress,
      },
    ])
  );

  // Combinar logros con su estado
  const achievementsWithStatus = allAchievements.map((achievement) => {
    const unlocked = unlockedMap.has(achievement.id);
    const unlockData = unlockedMap.get(achievement.id);

    return {
      ...achievement,
      isUnlocked: unlocked,
      unlockedAt: unlockData?.unlockedAt,
      currentProgress: unlockData?.currentProgress ?? 0,
      isCompleted: unlocked,
    };
  });

  // Separar en desbloqueados y pendientes
  const unlocked = achievementsWithStatus.filter((a) => a.isUnlocked);
  const locked = achievementsWithStatus.filter((a) => !a.isUnlocked);

  return {
    all: achievementsWithStatus,
    unlocked,
    locked,
    stats: {
      total: allAchievements.length,
      unlockedCount: unlocked.length,
      lockedCount: locked.length,
      completionPercentage: Math.round(
        (unlocked.length / allAchievements.length) * 100
      ),
    },
  };
}

/**
 * Obtiene solo los logros desbloqueados por el usuario
 */
export async function getUnlockedAchievements(userId: string) {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: {
      unlockedAt: 'desc',
    },
  });

  return userAchievements.map((ua) => ({
    ...ua.achievement,
    unlockedAt: ua.unlockedAt,
    currentProgress: ua.currentProgress,
  }));
}

/**
 * Obtiene los logros recientes del usuario
 */
export async function getRecentAchievements(userId: string, limit: number = 5) {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: {
      unlockedAt: 'desc',
    },
    take: limit,
  });

  return userAchievements.map((ua) => ({
    ...ua.achievement,
    unlockedAt: ua.unlockedAt,
    currentProgress: ua.currentProgress,
  }));
}

/**
 * Obtiene un logro específico por ID
 */
export async function getAchievementById(achievementId: string, userId: string) {
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
  });

  if (!achievement) {
    throw new Error('Logro no encontrado');
  }

  // Verificar si el usuario lo ha desbloqueado
  const userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId,
      },
    },
  });

  return {
    ...achievement,
    isUnlocked: !!userAchievement,
    unlockedAt: userAchievement?.unlockedAt,
    currentProgress: userAchievement?.currentProgress ?? 0,
  };
}

/**
 * Obtiene el progreso de un logro específico
 */
export async function getAchievementProgress(userId: string, achievementId: string) {
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
  });

  if (!achievement) {
    throw new Error('Logro no encontrado');
  }

  const userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId,
      },
    },
  });

  if (userAchievement) {
    return {
      achievementId,
      isUnlocked: true,
      currentProgress: userAchievement.currentProgress,
      requirementValue: achievement.requirementValue,
      percentage: 100,
      unlockedAt: userAchievement.unlockedAt,
    };
  }

  // Calcular progreso actual basado en el tipo de logro
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  let progress = 0;
  switch (achievement.achievementType) {
    case 'first_checkin':
      progress = user.totalWorkouts + user.totalClasses;
      break;
    case 'streak':
      progress = user.currentStreak;
      break;
    case 'total_workouts':
      progress = user.totalWorkouts + user.totalClasses;
      break;
    case 'points_earned':
      progress = user.totalPointsEarned;
      break;
    case 'level_reached':
      progress = user.level;
      break;
  }

  return {
    achievementId,
    isUnlocked: false,
    currentProgress: progress,
    requirementValue: achievement.requirementValue,
    percentage: Math.min(100, Math.round((progress / achievement.requirementValue) * 100)),
  };
}
