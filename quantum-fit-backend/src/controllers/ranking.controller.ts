import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthRequest } from '../types';

export async function getLeaderboard(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { points: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        level: true,
        points: true,
        currentStreak: true,
        totalWorkouts: true,
        avatarUrl: true,
      },
    });

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      ...u,
    }));

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener ranking',
    });
  }
}