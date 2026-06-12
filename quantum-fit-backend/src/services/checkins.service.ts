// Servicio de Check-ins
import { prisma } from '../database';
import { CheckInType, ValidationMethod, User } from '@prisma/client';
import { notifyUser } from './notification.service';
import { recalculateUserLevel } from './level.service';
import { getPointsForActivity } from './points-config.service';

const FALLBACK_POINTS: Record<string, number> = {
  CHECK_IN_CLASS: 75,
  CHECK_IN_OPEN_GYM: 50,
  CHECK_IN_PT: 100,
  STREAK_BONUS_7_DAYS: 100,
  STREAK_BONUS_30_DAYS: 500,
  PERFECT_WEEK_BONUS: 200,
};

async function getPoints(key: string, fallback: number): Promise<number> {
  try {
    const dbPoints = await getPointsForActivity(key);
    return dbPoints > 0 ? dbPoints : fallback;
  } catch {
    return fallback;
  }
}

interface CreateCheckInInput {
  userId: string;
  checkInType: CheckInType;
  validationMethod: ValidationMethod;
  gymLocation?: string;
  notes?: string;
}

interface CheckInResult {
  checkIn: unknown;
  pointsEarned: number;
  newBalance: number;
  streak: {
    current: number;
    isPerfectWeek: boolean;
  };
  achievementsUnlocked: unknown[];
}

/**
 * Crea un nuevo check-in y calcula puntos
 */
export async function createCheckIn(data: CreateCheckInInput): Promise<CheckInResult> {
  const { userId, checkInType, validationMethod, gymLocation, notes } = data;

  // Verificar si ya hizo check-in hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInTime: {
        gte: today,
      },
    },
  });

  if (existingCheckIn) {
    throw new Error('Ya registraste un check-in hoy');
  }

  // Calcular puntos según el tipo
  let pointsEarned = 0;
  switch (checkInType) {
    case 'CLASS':
      pointsEarned = await getPoints('CHECK_IN_CLASS', FALLBACK_POINTS.CHECK_IN_CLASS);
      break;
    case 'OPEN_GYM':
      pointsEarned = await getPoints('CHECK_IN_OPEN_GYM', FALLBACK_POINTS.CHECK_IN_OPEN_GYM);
      break;
    case 'PERSONAL_TRAINER':
      pointsEarned = await getPoints('CHECK_IN_PT', FALLBACK_POINTS.CHECK_IN_PT);
      break;
  }

  // Obtener usuario actual
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Calcular racha
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const hadCheckInYesterday = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInTime: {
        gte: yesterday,
        lt: today,
      },
    },
  });

  let newStreak = user.currentStreak;
  if (hadCheckInYesterday || user.lastCheckinDate === null) {
    newStreak = user.currentStreak + 1;
  } else {
    // Si no vino ayer, reiniciar racha (pero contar hoy como día 1)
    newStreak = 1;
  }

  // Crear check-in
  const checkIn = await prisma.checkIn.create({
    data: {
      userId,
      checkInType,
      pointsEarned,
      validationMethod,
      gymLocation,
      notes,
    },
  });

  // Actualizar usuario
  const newPointsBalance = user.points + pointsEarned;
  const newTotalPointsEarned = user.totalPointsEarned + pointsEarned;

  let updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      points: newPointsBalance,
      totalPointsEarned: newTotalPointsEarned,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastCheckinDate: today,
      lastActive: new Date(),
      ...(checkInType === 'CLASS' ? { totalClasses: user.totalClasses + 1 } : {}),
      ...(checkInType === 'OPEN_GYM' || checkInType === 'PERSONAL_TRAINER' 
        ? { totalWorkouts: user.totalWorkouts + 1 } 
        : {}),
    },
  });

  // Registrar en activity log
  await prisma.activityLog.create({
    data: {
      userId,
      activityType: checkInType === 'CLASS' ? 'CHECK_IN_CLASS' : 
                    checkInType === 'OPEN_GYM' ? 'CHECK_IN_OPEN_GYM' : 'CHECK_IN_PT',
      points: pointsEarned,
      pointsBalanceAfter: newPointsBalance,
      title: `Check-in: ${checkInType === 'CLASS' ? 'Clase' : checkInType === 'OPEN_GYM' ? 'Entrenamiento Libre' : 'Entrenador Personal'}`,
      description: `Registraste tu asistencia y ganaste ${pointsEarned} puntos`,
      referenceId: checkIn.id,
      referenceType: 'check_in',
    },
  });

  // Recalcular nivel
  await recalculateUserLevel(userId);

  // Actualizar estadísticas semanales
  const weeklyStats = await updateWeeklyStats(userId, pointsEarned, checkInType, new Date());

  // Verificar logros
  const achievementsUnlocked = await checkAchievements(userId, updatedUser);

  // Verificar bonus de racha
  let streakBonusPoints = 0;
  if (newStreak === 7) {
    streakBonusPoints = await getPoints('STREAK_BONUS_7_DAYS', FALLBACK_POINTS.STREAK_BONUS_7_DAYS);
    updatedUser = await addPoints(userId, streakBonusPoints, 'BONUS_RACHA_7_DIAS');
    achievementsUnlocked.push({ name: 'Racha de 7 días', points: streakBonusPoints });
  } else if (newStreak === 30) {
    streakBonusPoints = await getPoints('STREAK_BONUS_30_DAYS', FALLBACK_POINTS.STREAK_BONUS_30_DAYS);
    updatedUser = await addPoints(userId, streakBonusPoints, 'BONUS_RACHA_30_DIAS');
    achievementsUnlocked.push({ name: 'Racha de 30 días', points: streakBonusPoints });
  }

  // Notificar WebSocket
  notifyUser(userId, 'points-updated', {
    userId,
    newBalance: updatedUser.points,
    earned: pointsEarned + streakBonusPoints,
  });
  notifyUser(userId, 'streak-updated', {
    current: updatedUser.currentStreak,
    isPerfectWeek: weeklyStats?.isPerfectWeek || false,
  });
  if (achievementsUnlocked.length > 0) {
    notifyUser(userId, 'achievement-unlocked', {
      achievements: achievementsUnlocked,
      points: achievementsUnlocked.reduce<number>((sum, a) => {
        const achievement = a as { pointsReward?: number; points?: number };
        return sum + (achievement.pointsReward || achievement.points || 0);
      }, 0),
    });
  }

  return {
    checkIn,
    pointsEarned,
    newBalance: updatedUser.points,
    streak: {
      current: updatedUser.currentStreak,
      isPerfectWeek: weeklyStats?.isPerfectWeek || false,
    },
    achievementsUnlocked,
  };
}

/**
 * Actualiza las estadísticas semanales
 */
async function updateWeeklyStats(
  userId: string,
  pointsEarned: number,
  checkInType: string,
  checkInDate: Date
) {
  const year = checkInDate.getFullYear();
  const week = getWeekNumber(checkInDate);

  const weekStart = getMonday(checkInDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dayOfWeek = checkInDate.getDay();
  const bitmapDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const dayBit = 1 << bitmapDay;

  const existingStats = await prisma.weeklyStats.findUnique({
    where: {
      userId_year_week: {
        userId,
        year,
        week,
      },
    },
  });

  const newActiveDaysBitmap = existingStats 
    ? (existingStats.activeDaysBitmap | dayBit)
    : dayBit;

  const isClass = checkInType === 'CLASS';

  const weeklyStats = await prisma.weeklyStats.upsert({
    where: {
      userId_year_week: {
        userId,
        year,
        week,
      },
    },
    update: {
      workoutsCompleted: { increment: 1 },
      ...(isClass ? { classesAttended: { increment: 1 } } : {}),
      totalPoints: { increment: pointsEarned },
      totalCheckIns: { increment: 1 },
      activeDaysBitmap: newActiveDaysBitmap,
      updatedAt: new Date(),
    },
    create: {
      userId,
      year,
      week,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      workoutsCompleted: 1,
      ...(isClass ? { classesAttended: 1 } : {}),
      totalPoints: pointsEarned,
      totalCheckIns: 1,
      activeDaysBitmap: dayBit,
    },
  });

  const activeDays = countBits(weeklyStats.activeDaysBitmap);
  const attendanceRate = activeDays / 7 * 100;

  const updatedStats = await prisma.weeklyStats.update({
    where: { id: weeklyStats.id },
    data: {
      activeDays,
      attendanceRate,
      isPerfectWeek: activeDays === 7,
    },
  });

  if (updatedStats.isPerfectWeek && activeDays === 7) {
    const bonusPoints = await getPoints('PERFECT_WEEK_BONUS', FALLBACK_POINTS.PERFECT_WEEK_BONUS);
    await addPoints(userId, bonusPoints, 'SEMANA_PERFECTA');
  }

  return updatedStats;
}

/**
 * Verifica y desbloquea logros
 */
async function checkAchievements(userId: string, user: User) {
  const unlockedAchievements: unknown[] = [];

  // Obtener todos los logros activos
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  for (const achievement of achievements) {
    // Verificar si ya lo desbloqueó
    const alreadyUnlocked = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (alreadyUnlocked) continue;

    // Calcular progreso
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

    // Verificar si cumple los requisitos
    if (progress >= achievement.requirementValue) {
      // Desbloquear logro
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          currentProgress: progress,
        },
      });

      // Sumar puntos del logro
      if (achievement.pointsReward > 0) {
        const updatedUser = await addPoints(userId, achievement.pointsReward, `LOGRO_${achievement.name}`);
        notifyUser(userId, 'points-updated', {
          userId,
          newBalance: updatedUser.points,
          earned: achievement.pointsReward,
        });
      }

      // Notificar logro desbloqueado
      notifyUser(userId, 'achievement-unlocked', {
        achievement: {
          id: achievement.id,
          name: achievement.name,
          icon: achievement.icon,
          pointsReward: achievement.pointsReward,
        },
        points: achievement.pointsReward,
      });

      // Registrar en activity log
      await prisma.activityLog.create({
        data: {
          userId,
          activityType: 'ACHIEVEMENT_UNLOCKED',
          points: achievement.pointsReward,
          pointsBalanceAfter: user.points + achievement.pointsReward,
          title: `🏆 ${achievement.name}`,
          description: achievement.description,
          referenceId: achievement.id,
          referenceType: 'achievement',
        },
      });

      unlockedAchievements.push({
        id: achievement.id,
        name: achievement.name,
        icon: achievement.icon,
        pointsReward: achievement.pointsReward,
      });
    }
  }

  return unlockedAchievements;
}

/**
 * Agrega puntos al usuario
 */
async function addPoints(userId: string, points: number, _reason: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Usuario no encontrado');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      points: user.points + points,
      totalPointsEarned: user.totalPointsEarned + points,
    },
  });

  await recalculateUserLevel(userId);
  return updated;
}

/**
 * Obtiene el número de semana ISO
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Obtiene el lunes de la semana de una fecha
 */
function getMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Cuenta los bits encendidos en un número
 */
function countBits(num: number): number {
  let count = 0;
  while (num) {
    count += num & 1;
    num >>= 1;
  }
  return count;
}
