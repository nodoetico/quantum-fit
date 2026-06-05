// Rutas de Administración para Reservas
import { Router } from 'express';
import * as bookingsController from '../../controllers/admin/bookings.controller';
import { authenticate, requireStaff } from '../../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación y rol de staff
router.use(authenticate);
router.use(requireStaff);

// GET /api/admin/bookings - Listar todas las reservas
router.get('/', bookingsController.getAllBookings);

// GET /api/admin/bookings/stats/resumen - Estadísticas de reservas
router.get('/stats/resumen', bookingsController.getBookingsStats);

// GET /api/admin/bookings/:id - Obtener reserva por ID
router.get('/:id', bookingsController.getBookingById);

// POST /api/admin/bookings - Crear nueva reserva
router.post('/', bookingsController.createBooking);

// PUT /api/admin/bookings/:id - Actualizar reserva
router.put('/:id', bookingsController.updateBooking);

// DELETE /api/admin/bookings/:id - Eliminar reserva
router.delete('/:id', bookingsController.deleteBooking);

export default router;
