import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../database';

export async function getMyReferralCode(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { referralCode: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: { referralCode: user.referralCode } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener código de referido';
    res.status(400).json({ success: false, error: message });
  }
}

export async function getMyReferrals(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const referrals = await prisma.user.findMany({
      where: { referredBy: req.userId },
      select: { id: true, name: true, email: true, memberSince: true, level: true },
      orderBy: { memberSince: 'desc' },
    });

    res.status(200).json({ success: true, data: referrals });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener referidos';
    res.status(400).json({ success: false, error: message });
  }
}
