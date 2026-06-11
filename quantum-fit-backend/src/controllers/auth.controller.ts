// Controlador de Autenticación
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types';
import { UserRole } from '@prisma/client';

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, dni, referralCode } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password || !dni) {
      res.status(400).json({
        success: false,
        error: 'Nombre, email, DNI y contraseña son requeridos',
      });
      return;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      res.status(400).json({
        success: false,
        error: 'El DNI debe tener 7 u 8 dígitos numéricos',
      });
      return;
    }

    // Registrar usuario
    const result = await authService.registerUser({ name, email, password, dni, referralCode });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Usuario registrado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar usuario';

    if (message.includes('ya está registrado')) {
      res.status(409).json({
        success: false,
        error: message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/auth/login
 * Inicia sesión
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
      return;
    }

    // Login
    const result = await authService.loginUser({ email, password });

    // Set httpOnly cookie for web clients (admin panel)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    };
    res.cookie('accessToken', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login exitoso',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';

    res.status(401).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/auth/refresh
 * Refresca el token de acceso
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token es requerido',
      });
      return;
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al refrescar token';

    res.status(401).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/auth/me
 * Obtiene el perfil del usuario autenticado
 */
export async function getMe(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const user = await authService.getUserProfile(req.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener perfil';

    res.status(404).json({
      success: false,
      error: message,
    });
  }
}

/**
 * PUT /api/auth/profile
 * Actualiza el perfil del usuario
 */
export async function updateProfile(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    const { name, avatarUrl } = req.body;
    const updateData: { name?: string; avatarUrl?: string } = {};

    if (name) updateData.name = name;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    const user = await authService.updateUserProfile(req.userId, updateData);

    res.status(200).json({
      success: true,
      data: user,
      message: 'Perfil actualizado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar perfil';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/auth/users/count
 * Obtiene el conteo de usuarios (SOLO ADMIN)
 */
export async function getUsersCount(_req: Request, res: Response): Promise<void> {
  try {
    const count = await authService.getUsersCount();

    res.status(200).json({
      success: true,
      data: { total: count },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener conteo de usuarios';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/auth/users
 * Obtiene todos los usuarios (SOLO ADMIN)
 */
export async function getAllUsers(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const users = await authService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener usuarios';

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Solicita restablecimiento de contraseña
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: 'El email es requerido',
    });
    return;
  }

  await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
  });
}

/**
 * POST /api/auth/reset-password
 * Restablece la contraseña usando el token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'Token y nueva contraseña son requeridos',
      });
      return;
    }

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al restablecer contraseña';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/auth/users
 * Crea un nuevo usuario (SOLO ADMIN)
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role, isVip } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos',
      });
      return;
    }

    // Validar que el rol sea válido si se proporciona
    if (role) {
      const validRoles = ['USER', 'ADMIN', 'MANAGER', 'STAFF', 'VIP'];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Rol inválido. Los roles válidos son: USER, ADMIN, MANAGER, STAFF, VIP',
        });
        return;
      }
    }

    // Registrar usuario con rol
    const result = await authService.registerUser({ 
      name, 
      email, 
      password,
      role: role || 'USER',
      isVip: isVip || false
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Usuario creado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear usuario';

    if (message.includes('ya está registrado')) {
      res.status(409).json({
        success: false,
        error: message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * PUT /api/auth/users/:id/role
 * Actualiza el rol de un usuario (SOLO ADMIN)
 */
export async function updateUserRole(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({
        success: false,
        error: 'El rol es requerido',
      });
      return;
    }

    // Validar que el rol sea válido
    const validRoles = ['USER', 'ADMIN', 'MANAGER', 'STAFF', 'VIP'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Rol inválido. Los roles válidos son: USER, ADMIN, MANAGER, STAFF, VIP',
      });
      return;
    }

    const user = await authService.updateUserRole(id, role as UserRole);

    res.status(200).json({
      success: true,
      data: user,
      message: 'Rol actualizado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar rol';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * DELETE /api/auth/users/:id
 * Elimina un usuario (SOLO ADMIN)
 */
export async function deleteUser(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await authService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar usuario';

    res.status(400).json({
      success: false,
      error: message,
    });
  }
}
