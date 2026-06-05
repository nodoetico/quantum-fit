// Rutas de Administración para Clases/Cursos
import { Router } from 'express';
import * as classesController from '../../controllers/admin/classes.controller';
import { authenticate, requireStaff } from '../../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación y rol de staff
router.use(authenticate);
router.use(requireStaff);

// GET /api/admin/classes - Listar todas las clases
router.get('/', classesController.getAllClasses);

// GET /api/admin/classes/stats/resumen - Estadísticas de clases
router.get('/stats/resumen', classesController.getClassesStats);

// GET /api/admin/classes/:id - Obtener clase por ID
router.get('/:id', classesController.getClassById);

// POST /api/admin/classes - Crear nueva clase
router.post('/', classesController.createClass);

// PUT /api/admin/classes/:id - Actualizar clase
router.put('/:id', classesController.updateClass);

// DELETE /api/admin/classes/:id - Eliminar clase
router.delete('/:id', classesController.deleteClass);

export default router;
