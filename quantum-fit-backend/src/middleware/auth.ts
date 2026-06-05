import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest } from '../types';
import { UserRole } from '@prisma/client';

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }
  return null;
}

export function authenticate(
  req: Request & AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación',
      });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
      });
      return;
    }

    req.userId = payload.userId;
    req.role = payload.role || 'USER';

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

export function optionalAuth(
  req: Request & AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyAccessToken(token);

      if (payload) {
        req.userId = payload.userId;
        req.role = payload.role || 'USER';
      }
    }

    next();
  } catch (error) {
    next();
  }
}

export function requireAdmin(
  req: Request & AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const allowedRoles: UserRole[] = ['ADMIN', 'MANAGER'];

  if (!req.role || !allowedRoles.includes(req.role as UserRole)) {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador',
    });
    return;
  }

  next();
}

export function requireStaff(
  req: Request & AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const allowedRoles: UserRole[] = ['ADMIN', 'MANAGER', 'STAFF'];

  if (!req.role || !allowedRoles.includes(req.role as UserRole)) {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de staff',
    });
    return;
  }

  next();
}

export function requireVip(
  req: Request & AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.role !== 'VIP' && req.role !== 'ADMIN' && req.role !== 'MANAGER') {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere suscripción VIP',
    });
    return;
  }

  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (
    req: Request & AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.role || !roles.includes(req.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado. No tienes los permisos necesarios',
      });
      return;
    }

    next();
  };
}
