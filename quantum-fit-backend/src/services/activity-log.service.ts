// Servicio de Activity Log
import { prisma } from '../database';

interface ActivityLogOptions {
  userId: string;
  limit?: number;
  offset?: number;
}

interface ActivityLogResult {
  logs: unknown[];
  total: number;
  hasMore: boolean;
}

/**
 * Obtiene el historial de actividad del usuario
 */
export async function getActivityLog({
  userId,
  limit = 50,
  offset = 0,
}: ActivityLogOptions): Promise<ActivityLogResult> {
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.activityLog.count({ where: { userId } }),
  ]);

  return {
    logs,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Obtiene las últimas actividades (sin paginación)
 */
export async function getRecentActivity(userId: string, limit: number = 10) {
  return await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
