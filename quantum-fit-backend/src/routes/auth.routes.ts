// Rutas de Autenticación
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rutas protegidas (usuarios autenticados)
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Rutas solo para ADMIN
router.post('/users', authenticate, requireAdmin, authController.createUser);
router.get('/users', authenticate, requireAdmin, authController.getAllUsers);
router.get('/users/count', authenticate, requireAdmin, authController.getUsersCount);
router.put('/users/:id/role', authenticate, requireAdmin, authController.updateUserRole);
router.delete('/users/:id', authenticate, requireAdmin, authController.deleteUser);

export default router;
