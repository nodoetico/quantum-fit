import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthRequest } from '../types';

export async function getAvailableClasses(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const classes = await prisma.class.findMany({
      where: {
        isActive: true,
        isCancelled: false,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
      take: 50,
    });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener clases',
    });
  }
}

export async function getClassById(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const classItem = await prisma.class.findUnique({
      where: { id },
    });

    if (!classItem) {
      res.status(404).json({
        success: false,
        error: 'Clase no encontrada',
      });
      return;
    }

    res.json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener clase',
    });
  }
}

export async function bookClass(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { id } = req.params;

    const classItem = await prisma.class.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!classItem) {
      res.status(404).json({
        success: false,
        error: 'Clase no encontrada',
      });
      return;
    }

    if (!classItem.isActive || classItem.isCancelled) {
      res.status(400).json({
        success: false,
        error: 'La clase no está disponible',
      });
      return;
    }

    if (classItem.bookedSpots >= classItem.totalSpots) {
      res.status(400).json({
        success: false,
        error: 'La clase está completa',
      });
      return;
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: req.userId,
        classId: id,
        status: 'CONFIRMED',
      },
    });

    if (existingBooking) {
      res.status(400).json({
        success: false,
        error: 'Ya tienes una reserva en esta clase',
      });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.userId,
        classId: id,
        status: 'CONFIRMED',
      },
    });

    await prisma.class.update({
      where: { id },
      data: { bookedSpots: { increment: 1 } },
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Clase reservada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al reservar clase',
    });
  }
}