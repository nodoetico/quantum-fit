// Controlador para gestión de Clases/Cursos (Admin)
import { Request, Response } from 'express';
import { prisma } from '../../database';
import { DifficultyLevel } from '@prisma/client';

/**
 * GET /api/admin/classes
 * Obtiene todas las clases con filtros
 */
export async function getAllClasses(req: Request, res: Response): Promise<void> {
  try {
    const { 
      activityType, 
      difficultyLevel, 
      instructorId,
      isActive,
      page = '1', 
      limit = '20' 
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Filtros
    const where: Record<string, unknown> = {};

    if (activityType) {
      where.activityType = activityType as string;
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel as DifficultyLevel;
    }

    if (instructorId) {
      where.instructorId = instructorId as string;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Obtener clases con relaciones
    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.class.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        classes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener clases';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/admin/classes/:id
 * Obtiene una clase específica
 */
export async function getClassById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const clase = await prisma.class.findUnique({
      where: { id },
      include: {
        bookings: {
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
          },
        },
      },
    });

    if (!clase) {
      res.status(404).json({
        success: false,
        error: 'Clase no encontrada',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: clase,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener clase';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/admin/classes
 * Crea una nueva clase
 */
export async function createClass(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      instructorId,
      instructorName,
      startTime,
      endTime,
      durationMinutes,
      totalSpots,
      activityType,
      difficultyLevel,
      location,
      gymZone,
    } = req.body;

    // Validar campos requeridos
    if (!name || !startTime || !endTime || !totalSpots || !activityType) {
      res.status(400).json({
        success: false,
        error: 'Nombre, startTime, endTime, totalSpots y activityType son requeridos',
      });
      return;
    }

    // Validar que el endTime sea después del startTime
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      res.status(400).json({
        success: false,
        error: 'El endTime debe ser posterior al startTime',
      });
      return;
    }

    // Crear clase
    const clase = await prisma.class.create({
      data: {
        name,
        description: description || null,
        instructorId: instructorId || null,
        instructorName: instructorName || 'Por definir',
        startTime: start,
        endTime: end,
        durationMinutes: durationMinutes || Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
        totalSpots: parseInt(totalSpots, 10),
        bookedSpots: 0,
        activityType,
        difficultyLevel: (difficultyLevel as DifficultyLevel) || DifficultyLevel.INTERMEDIO,
        location: location || null,
        gymZone: gymZone || null,
        isActive: true,
        isCancelled: false,
      },
    });

    res.status(201).json({
      success: true,
      data: clase,
      message: 'Clase creada exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear clase';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * PUT /api/admin/classes/:id
 * Actualiza una clase existente
 */
export async function updateClass(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: Record<string, unknown> = {};

    // Campos actualizables
    const allowedFields = [
      'name',
      'description',
      'instructorId',
      'instructorName',
      'startTime',
      'endTime',
      'durationMinutes',
      'totalSpots',
      'activityType',
      'difficultyLevel',
      'location',
      'gymZone',
      'isActive',
      'isCancelled',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'startTime' || field === 'endTime') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    // Validar que el endTime sea después del startTime si ambos están presentes
    if (updateData.startTime && updateData.endTime) {
      const start = new Date(updateData.startTime as string);
      const end = new Date(updateData.endTime as string);
      
      if (end <= start) {
        res.status(400).json({
          success: false,
          error: 'El endTime debe ser posterior al startTime',
        });
        return;
      }
    }

    // Si se actualiza totalSpots, validar que no sea menor a bookedSpots
    if (updateData.totalSpots !== undefined) {
      const clase = await prisma.class.findUnique({ where: { id } });
      
      if (clase && (updateData.totalSpots as number) < clase.bookedSpots) {
        res.status(400).json({
          success: false,
          error: `No se puede reducir la capacidad por debajo de los lugares reservados (${clase.bookedSpots})`,
        });
        return;
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updatedClass,
      message: 'Clase actualizada exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar clase';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * DELETE /api/admin/classes/:id
 * Elimina una clase (o la marca como inactiva)
 */
export async function deleteClass(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const clase = await prisma.class.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
        },
      },
    });

    if (!clase) {
      res.status(404).json({
        success: false,
        error: 'Clase no encontrada',
      });
      return;
    }

    // Si tiene reservas activas, mejor marcarla como cancelada/inactiva
    if (clase.bookings.length > 0) {
      res.status(400).json({
        success: false,
        error: 'La clase tiene reservas activas. No se puede eliminar.',
        message: 'Se recomienda marcar la clase como inactiva o cancelada en lugar de eliminarla',
      });
      return;
    }

    // Eliminar clase
    await prisma.class.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Clase eliminada exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar clase';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/admin/classes/stats/resumen
 * Obtiene estadísticas de clases
 */
export async function getClassesStats(_req: Request, res: Response): Promise<void> {
  try {
    const [total, active, cancelled, totalBookings] = await Promise.all([
      prisma.class.count(),
      prisma.class.count({ where: { isActive: true } }),
      prisma.class.count({ where: { isCancelled: true } }),
      prisma.booking.count(),
    ]);

    // Calcular ocupación promedio
    const classes = await prisma.class.findMany({
      select: {
        totalSpots: true,
        bookedSpots: true,
      },
    });

    let avgOccupancy = 0;
    if (classes.length > 0) {
      const totalCapacity = classes.reduce((sum, c) => sum + c.totalSpots, 0);
      const totalBooked = classes.reduce((sum, c) => sum + c.bookedSpots, 0);
      avgOccupancy = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;
    }

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        cancelled,
        totalBookings,
        avgOccupancy: Math.round(avgOccupancy * 100) / 100,
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
