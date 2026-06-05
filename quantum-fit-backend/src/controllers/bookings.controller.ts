import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthRequest } from '../types';

export async function getMyBookings(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.userId,
        status: { not: 'CANCELLED' },
      },
      include: {
        class: true,
      },
      orderBy: { bookedAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener reservas',
    });
  }
}

export async function cancelBooking(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
      });
      return;
    }

    if (booking.userId !== req.userId) {
      res.status(403).json({
        success: false,
        error: 'No tienes permiso para cancelar esta reserva',
      });
      return;
    }

    if (booking.status === 'CANCELLED') {
      res.status(400).json({
        success: false,
        error: 'La reserva ya está cancelada',
      });
      return;
    }

    await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    await prisma.class.update({
      where: { id: booking.classId },
      data: { bookedSpots: { decrement: 1 } },
    });

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cancelar reserva',
    });
  }
}