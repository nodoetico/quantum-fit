// Controlador para gestión de Reservas (Admin)
import { Request, Response } from 'express';
import { prisma } from '../../database';
import { BookingStatus } from '@prisma/client';

/**
 * GET /api/admin/bookings
 * Obtiene todas las reservas con filtros
 */
export async function getAllBookings(req: Request, res: Response): Promise<void> {
  try {
    const { status, classId, userId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Filtros
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status as BookingStatus;
    }

    if (classId) {
      where.classId = classId;
    }

    if (userId) {
      where.userId = userId;
    }

    // Obtener reservas con relaciones
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              role: true,
              isVip: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
              activityType: true,
              instructorName: true,
            },
          },
        },
        orderBy: { bookedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener reservas';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/admin/bookings/:id
 * Obtiene una reserva específica
 */
export async function getBookingById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            isVip: true,
            points: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            startTime: true,
            endTime: true,
            activityType: true,
            instructorName: true,
            location: true,
            totalSpots: true,
            bookedSpots: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener reserva';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/admin/bookings
 * Crea una reserva manualmente (para staff)
 */
export async function createBooking(req: Request, res: Response): Promise<void> {
  try {
    const { userId, classId } = req.body;

    if (!userId || !classId) {
      res.status(400).json({
        success: false,
        error: 'userId y classId son requeridos',
      });
      return;
    }

    // Verificar que la clase existe y tiene lugares
    const clase = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!clase) {
      res.status(404).json({
        success: false,
        error: 'Clase no encontrada',
      });
      return;
    }

    if (clase.bookedSpots >= clase.totalSpots) {
      res.status(400).json({
        success: false,
        error: 'La clase está llena',
      });
      return;
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
      return;
    }

    // Verificar que el usuario no tenga ya una reserva en esa clase
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        classId,
      },
    });

    if (existingBooking) {
      res.status(400).json({
        success: false,
        error: 'El usuario ya tiene una reserva en esta clase',
      });
      return;
    }

    // Crear reserva
    const booking = await prisma.booking.create({
      data: {
        userId,
        classId,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            startTime: true,
          },
        },
      },
    });

    // Actualizar lugares ocupados de la clase
    await prisma.class.update({
      where: { id: classId },
      data: {
        bookedSpots: clase.bookedSpots + 1,
      },
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Reserva creada exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear reserva';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * PUT /api/admin/bookings/:id
 * Actualiza el estado de una reserva
 */
export async function updateBooking(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, attended } = req.body;

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

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status as BookingStatus;
      
      // Si se cancela, actualizar timestamp
      if (status === BookingStatus.CANCELLED) {
        updateData.cancelledAt = new Date();
        
        // Liberar lugar en la clase
        const clase = await prisma.class.findUnique({
          where: { id: booking.classId },
        });
        
        if (clase && clase.bookedSpots > 0) {
          await prisma.class.update({
            where: { id: booking.classId },
            data: { bookedSpots: clase.bookedSpots - 1 },
          });
        }
      }
    }

    if (attended !== undefined) {
      updateData.attended = attended;
      
      // Si asistió, actualizar estadísticas del usuario
      if (attended) {
        await prisma.user.update({
          where: { id: booking.userId },
          data: {
            totalClasses: { increment: 1 },
          },
        });
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            startTime: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: 'Reserva actualizada exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar reserva';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * DELETE /api/admin/bookings/:id
 * Elimina una reserva
 */
export async function deleteBooking(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
      });
      return;
    }

    // Eliminar reserva
    await prisma.booking.delete({
      where: { id },
    });

    // Liberar lugar en la clase
    if (booking.class.bookedSpots > 0) {
      await prisma.class.update({
        where: { id: booking.classId },
        data: { bookedSpots: booking.class.bookedSpots - 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reserva eliminada exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar reserva';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/admin/bookings/stats/resumen
 * Obtiene estadísticas de reservas
 */
export async function getBookingsStats(_req: Request, res: Response): Promise<void> {
  try {
    const [total, confirmed, cancelled, completed, noShow] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { status: BookingStatus.NO_SHOW } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: {
          confirmed,
          cancelled,
          completed,
          noShow,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}
