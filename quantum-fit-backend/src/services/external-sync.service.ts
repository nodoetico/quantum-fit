// Servicio de Sincronización Externa
import { prisma } from '../database';
import { CheckInType, ValidationMethod } from '@prisma/client';
import { notifyUser } from './notification.service';
import { recalculateUserLevel } from './level.service';
import { getPointsForActivity } from './points-config.service';

interface ExternalCheckIn {
  dni: string;
  checkInTime: Date;
  type?: 'entry' | 'exit';
  location?: string;
}

interface CheckInResult {
  success: boolean;
  userId?: string;
  userName?: string;
  pointsEarned?: number;
  newBalance?: number;
  currentStreak?: number;
  message?: string;
  error?: string;
}

/**
 * Procesa un check-in recibido del software externo
 */
export async function processExternalCheckIn(data: ExternalCheckIn): Promise<CheckInResult> {
  const { dni, checkInTime, type, location } = data;

  const user = await prisma.user.findFirst({
    where: { dni: dni.trim() },
  });

  if (!user) {
    return {
      success: false,
      error: `Usuario no encontrado con DNI: ${dni}`,
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      error: `Usuario inactivo: ${dni}`,
    };
  }

  if (type === 'exit') {
    await processCheckOut(user.id, checkInTime);
    return {
      success: true,
      userId: user.id,
      userName: user.name,
      message: 'Check-out registrado',
    };
  }

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId: user.id,
      checkInTime: {
        gte: new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate()),
        lt: new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate() + 1),
      },
      validationMethod: ValidationMethod.EXTERNAL_SYSTEM,
    },
  });

  if (existingCheckIn) {
    return {
      success: true,
      userId: user.id,
      userName: user.name,
      pointsEarned: 0,
      newBalance: user.points,
      currentStreak: user.currentStreak,
      message: 'Check-in ya registrado anteriormente hoy',
    };
  }

  const pointsEarned = await getPointsForActivity('CHECK_IN_OPEN_GYM').catch(() => 50);

  const yesterday = new Date(checkInTime);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const dayStart = new Date(checkInTime);
  dayStart.setHours(0, 0, 0, 0);

  const hadCheckInYesterday = await prisma.checkIn.findFirst({
    where: {
      userId: user.id,
      checkInTime: {
        gte: yesterday,
        lt: dayStart,
      },
    },
  });

  let newStreak = user.currentStreak;
  if (hadCheckInYesterday || user.lastCheckinDate === null) {
    newStreak = user.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      userId: user.id,
      checkInType: CheckInType.OPEN_GYM,
      pointsEarned,
      validationMethod: ValidationMethod.EXTERNAL_SYSTEM,
      checkInTime,
      gymLocation: location || 'Sistema Externo',
    },
  });

  const newPointsBalance = user.points + pointsEarned;
  const newTotalPointsEarned = user.totalPointsEarned + pointsEarned;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      points: newPointsBalance,
      totalPointsEarned: newTotalPointsEarned,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastCheckinDate: dayStart,
      lastActive: new Date(),
      totalWorkouts: user.totalWorkouts + 1,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      activityType: 'CHECK_IN_OPEN_GYM',
      points: pointsEarned,
      pointsBalanceAfter: newPointsBalance,
      title: 'Check-in: Gimnasio (Sistema Externo)',
      description: `Registro de asistencia sincronizado. Ganaste ${pointsEarned} puntos`,
      referenceId: checkIn.id,
      referenceType: 'check_in',
      metadata: {
        source: 'external_system',
        dni,
        location,
      },
    },
  });

  await recalculateUserLevel(user.id);

  await updateWeeklyStats(user.id, pointsEarned, checkInTime);

  notifyUser(user.id, 'points-updated', {
    userId: user.id,
    newBalance: updatedUser.points,
    earned: pointsEarned,
  });
  notifyUser(user.id, 'streak-updated', {
    current: updatedUser.currentStreak,
    isPerfectWeek: false,
  });

  return {
    success: true,
    userId: user.id,
    userName: user.name,
    pointsEarned,
    newBalance: updatedUser.points,
    currentStreak: updatedUser.currentStreak,
    message: 'Check-in registrado exitosamente',
  };
}

/**
 * Procesa un batch de check-ins
 */
export async function processBatchCheckIns(
  checkins: ExternalCheckIn[]
): Promise<CheckInResult[]> {
  const results: CheckInResult[] = [];

  for (const checkIn of checkins) {
    try {
      const result = await processExternalCheckIn(checkIn);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  return results;
}

/**
 * Procesa check-out (registra hora de salida)
 */
async function processCheckOut(userId: string, checkOutTime: Date): Promise<void> {
  const dayStart = new Date(checkOutTime);
  dayStart.setHours(0, 0, 0, 0);

  const latestCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInTime: {
        gte: dayStart,
        lt: new Date(dayStart.getTime() + 86400000),
      },
    },
    orderBy: { checkInTime: 'desc' },
  });

  if (latestCheckIn && !latestCheckIn.checkOutTime) {
    await prisma.checkIn.update({
      where: { id: latestCheckIn.id },
      data: { checkOutTime },
    });
  }
}

/**
 * Actualiza estadísticas semanales
 */
async function updateWeeklyStats(userId: string, pointsEarned: number, checkInDate: Date) {
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
      totalPoints: { increment: pointsEarned },
      totalCheckIns: { increment: 1 },
      activeDaysBitmap: newActiveDaysBitmap,
    },
    create: {
      userId,
      year,
      week,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      workoutsCompleted: 1,
      totalPoints: pointsEarned,
      totalCheckIns: 1,
      activeDaysBitmap: dayBit,
    },
  });

  const activeDays = countBits(weeklyStats.activeDaysBitmap);
  const attendanceRate = activeDays / 7 * 100;
  await prisma.weeklyStats.update({
    where: { id: weeklyStats.id },
    data: {
      activeDays,
      attendanceRate,
      isPerfectWeek: activeDays === 7,
    },
  });
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function countBits(num: number): number {
  let count = 0;
  while (num) {
    count += num & 1;
    num >>= 1;
  }
  return count;
}
