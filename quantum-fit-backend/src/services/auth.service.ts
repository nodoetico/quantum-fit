// Servicio de Autenticación
import { prisma } from '../database';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, generateResetToken, verifyResetToken } from '../utils/jwt';
import { User, UserRole } from '@prisma/client';
import { assignReferralCode, processReferral } from './referral.service';
import { sendResetPasswordEmail } from './email.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

async function isAccountLocked(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { lockedUntil: true, failedLoginAttempts: true },
  });
  if (!user || !user.lockedUntil) return false;
  if (Date.now() >= user.lockedUntil.getTime()) {
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { lockedUntil: null, failedLoginAttempts: 0 },
    });
    return false;
  }
  return true;
}

async function recordFailedAttempt(email: string): Promise<number> {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, failedLoginAttempts: true, lockedUntil: true },
  });
  if (!user) return 0;

  const newCount = (user.failedLoginAttempts || 0) + 1;
  const shouldLock = newCount >= MAX_FAILED_ATTEMPTS;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: newCount,
      lastFailedLogin: now,
      lockedUntil: shouldLock ? new Date(now.getTime() + LOCKOUT_DURATION_MS) : null,
    },
  });

  return newCount;
}

async function resetFailedAttempts(email: string): Promise<void> {
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  }).catch(() => {});
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  dni?: string;
  role?: UserRole;
  isVip?: boolean;
  referralCode?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Registra un nuevo usuario
 */
export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  // Validar contraseña
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error);
  }

  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Hashear contraseña
  const passwordHash = await hashPassword(data.password);

  // Verificar si el DNI ya existe (si se proporcionó)
  if (data.dni) {
    const existingDni = await prisma.user.findUnique({
      where: { dni: data.dni },
    });

    if (existingDni) {
      throw new Error('El DNI ya está registrado');
    }
  }

  // Crear usuario con puntos de bienvenida
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      ...(data.dni && { dni: data.dni }),
      passwordHash,
      role: data.role || UserRole.USER,
      isVip: data.isVip || false,
      points: 100, // Puntos de bienvenida
      totalPointsEarned: 100,
    },
  });

  // Registrar actividad de bienvenida
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      activityType: 'MANUAL_ADJUSTMENT',
      points: 100,
      pointsBalanceAfter: 100,
      title: '¡Bienvenido a QUANTUM FIT!',
      description: 'Bonus de bienvenida: +100 puntos',
    },
  });

  // Asignar código de referido
  await assignReferralCode(user.id, user.name);

  // Procesar referido si se proporcionó un código
  if (data.referralCode) {
    try {
      await processReferral(user.id, data.referralCode);
    } catch {
      // Si el código es inválido, no bloquear el registro
    }
  }

  // NOTA: Crystal no tiene endpoint público por DNI.
  // La sincronización de datos históricos (membresías, asistencias) se hará
  // cuando Crystal envíe check-ins vía POST /api/external/checkin.
  // Mientras tanto, el usuario arranca con puntos de bienvenida.

  // Generar tokens con el rol del usuario
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remover passwordHash del usuario
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Inicia sesión con email y contraseña
 */
export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const emailLower = data.email.toLowerCase();

  // Verificar bloqueo por intentos fallidos
  if (await isAccountLocked(emailLower)) {
    throw new Error('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.');
  }

  // Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (!user) {
    await recordFailedAttempt(emailLower);
    throw new Error('Credenciales inválidas');
  }

  // Verificar contraseña
  const isValidPassword = await comparePassword(data.password, user.passwordHash);

  if (!isValidPassword) {
    await recordFailedAttempt(emailLower);
    throw new Error('Credenciales inválidas');
  }

  // Login exitoso — resetear intentos fallidos
  await resetFailedAttempts(emailLower);

  // Verificar que la cuenta esté activa
  if (!user.isActive) {
    throw new Error('Cuenta desactivada. Contacta a soporte.');
  }

  // Actualizar última actividad
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActive: new Date() },
  });

  // Generar tokens con el rol real del usuario desde la BD
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remover passwordHash del usuario
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Refresca el token de acceso
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const payload = await import('../utils/jwt').then(m => m.verifyRefreshToken(refreshToken));

  if (!payload) {
    throw new Error('Refresh token inválido o expirado');
  }

  // Verificar que el usuario exista y esté activo
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive) {
    throw new Error('Usuario no encontrado o inactivo');
  }

  // Generar nuevos tokens con el rol actualizado
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Obtiene el perfil de un usuario
 */
export async function getUserProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Actualiza el perfil de un usuario
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string }
): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Actualiza el rol de un usuario (solo admin)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Obtiene el conteo total de usuarios activos
 */
export async function getUsersCount(): Promise<number> {
  return await prisma.user.count({
    where: { isActive: true },
  });
}

/**
 * Procesa solicitud de restablecimiento de contraseña.
 * Siempre responde igual para evitar email enumeration.
 * Si SMTP está configurado, envía email con el token.
 * Si no, muestra el token en consola (desarrollo).
 */
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return;

  const resetToken = generateResetToken({
    userId: user.id,
    email: user.email,
  });

  await sendResetPasswordEmail(user.email, resetToken);
}

/**
 * Restablece la contraseña usando un token válido
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error);
  }

  const payload = verifyResetToken(token);
  if (!payload) {
    throw new Error('Token inválido o expirado');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
}

/**
 * Obtiene todos los usuarios (solo admin)
 */
export async function getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users.map(({ passwordHash: _, ...user }) => user);
}

/**
 * Elimina un usuario (solo admin)
 */
export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });
}
