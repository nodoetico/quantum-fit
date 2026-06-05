// Servicio de Weekly Stats
import { prisma } from '../database';

/**
 * Obtiene las estadísticas semanales del usuario
 */
export async function getWeeklyStats(userId: string) {
  // Obtener estadísticas de las últimas 4 semanas
  const stats = await prisma.weeklyStats.findMany({
    where: { userId },
    orderBy: [
      { year: 'desc' },
      { week: 'desc' },
    ],
    take: 4,
  });

  // Obtener estadísticas de la semana actual
  const currentYear = new Date().getFullYear();
  const currentWeek = getWeekNumber(new Date());

  let currentWeekStats = stats.find(
    (s) => s.year === currentYear && s.week === currentWeek
  );

  // Si no existe, crear estadísticas vacías para la semana actual
  if (!currentWeekStats) {
    const weekStart = getMonday(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    currentWeekStats = await prisma.weeklyStats.create({
      data: {
        userId,
        year: currentYear,
        week: currentWeek,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        workoutsCompleted: 0,
        totalPoints: 0,
        totalCheckIns: 0,
        activeDaysBitmap: 0,
        activeDays: 0,
        isPerfectWeek: false,
      },
    });
  }

  return {
    currentWeek: currentWeekStats,
    previousWeeks: stats.filter(
      (s) => !(s.year === currentYear && s.week === currentWeek)
    ),
    summary: {
      totalWeeks: stats.length,
      perfectWeeks: stats.filter((s) => s.isPerfectWeek).length,
      totalWorkouts: stats.reduce((sum, s) => sum + s.workoutsCompleted, 0),
      totalPoints: stats.reduce((sum, s) => sum + s.totalPoints, 0),
    },
  };
}

/**
 * Obtiene el progreso de la semana actual
 */
export async function getCurrentWeekProgress(userId: string) {
  const currentYear = new Date().getFullYear();
  const currentWeek = getWeekNumber(new Date());

  const stats = await prisma.weeklyStats.findUnique({
    where: {
      userId_year_week: {
        userId,
        year: currentYear,
        week: currentWeek,
      },
    },
  });

  if (!stats) {
    return {
      week: currentWeek,
      year: currentYear,
      workoutsCompleted: 0,
      totalPoints: 0,
      totalCheckIns: 0,
      activeDays: 0,
      isPerfectWeek: false,
      daysRemaining: 7,
    };
  }

  // Calcular días restantes en la semana
  const today = new Date();
  const weekEnd = stats.weekEndDate;
  const diffTime = weekEnd.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) + 1;

  return {
    week: currentWeek,
    year: currentYear,
    workoutsCompleted: stats.workoutsCompleted,
    totalPoints: stats.totalPoints,
    totalCheckIns: stats.totalCheckIns,
    activeDays: stats.activeDays,
    isPerfectWeek: stats.isPerfectWeek,
    daysRemaining,
  };
}

/**
 * Obtiene el número de semana ISO
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
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
