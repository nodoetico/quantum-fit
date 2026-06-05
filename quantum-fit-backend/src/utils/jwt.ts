// Utilidades para JWT
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta variable de entorno ${name}. Configúrala en el archivo .env para generar/verificar tokens JWT.`
    );
  }
  return value;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

function getJwtSecret(): string {
  return requireEnv('JWT_SECRET');
}

function getRefreshSecret(): string {
  return requireEnv('REFRESH_TOKEN_SECRET');
}

function getResetSecret(): string {
  return process.env.RESET_TOKEN_SECRET || getJwtSecret();
}

/**
 * Genera un token de acceso JWT
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Genera un refresh token JWT
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verifica y decodifica un token de acceso
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica y decodifica un refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getRefreshSecret()) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Genera un token para restablecimiento de contraseña (expira en 1h)
 */
export function generateResetToken(payload: JwtPayload): string {
  return jwt.sign(payload, getResetSecret(), { expiresIn: '1h' } as jwt.SignOptions);
}

/**
 * Verifica un token de restablecimiento de contraseña
 */
export function verifyResetToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getResetSecret()) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decodifica un token sin verificar (para debug)
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}
