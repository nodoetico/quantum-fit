import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { createPreference, processPaymentWebhook } from '../services/mercadopago.service';
import { prisma } from '../database';

export async function createMercadoPagoPreference(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { planId, planName, price } = req.body;
    const userId = req.userId!;

    if (!planId || !planName || !price) {
      res.status(400).json({
        success: false,
        error: 'planId, planName y price son requeridos',
      });
      return;
    }

    if (typeof price !== 'number' || price <= 0) {
      res.status(400).json({
        success: false,
        error: 'price debe ser un número positivo',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    const preference = await createPreference({
      planId,
      planName,
      price,
      userId,
      userEmail: user.email,
      userName: user.name,
    });

    res.json({
      success: true,
      data: preference,
    });
  } catch (error: unknown) {
    const err = error as any;
    const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Error al crear preferencia de pago';
    console.error('[MercadoPago] Error al crear preferencia:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
    res.status(502).json({
      success: false,
      error: message,
    });
  }
}

export async function handleMercadoPagoWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { type, data } = req.body;

    if (!type || !data?.id) {
      res.status(400).json({ success: false, error: 'Datos inválidos' });
      return;
    }

    res.status(200).json({ success: true });

    await processPaymentWebhook(data.id.toString(), type);
  } catch {
    res.status(200).json({ success: true });
  }
}

export async function handleMercadoPagoRedirect(_req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    message: 'Procesando pago...',
  });
}

export async function handleMercadoPagoManualApprove(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, error: 'userId es requerido' });
      return;
    }

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId,
          amount: 0,
          currency: 'ARS',
          paymentType: 'SUBSCRIPTION_VIP',
          status: 'APPROVED',
          mpPaymentId: `manual_${Date.now()}`,
          description: 'Activación manual (demo)',
          paidAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          isVip: true,
          vipSince: new Date(),
        },
      }),
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          subscriptionType: 'VIP_MONTHLY',
          status: 'ACTIVE',
          price: 0,
          currency: 'ARS',
          billingCycle: 'MONTHLY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          status: 'ACTIVE',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    res.json({ success: true, message: 'Pago activado manualmente' });
  } catch {
    res.status(500).json({ success: false, error: 'Error al activar el pago manual' });
  }
}
