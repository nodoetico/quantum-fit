// Tipos TypeScript para QUANTUM FIT Backend

import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role?: UserRole;
}

export interface AuthRequest {
  userId?: string;
  role?: UserRole;
}

// Tipos para Check-ins
export type CheckInType = 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER';
export type ValidationMethod = 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE' | 'EXTERNAL_SYSTEM';

// Tipos para Bookings
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

// Tipos para Activity Log
export type ActivityType =
  | 'CHECK_IN_CLASS'
  | 'CHECK_IN_OPEN_GYM'
  | 'CHECK_IN_PT'
  | 'BOOKING_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'STREAK_BONUS'
  | 'REWARD_REDEEMED'
  | 'REFERRAL_BONUS'
  | 'MANUAL_ADJUSTMENT';

// Tipos para Rewards
export type RewardCategory = 'PRODUCTO' | 'BEBIDA' | 'DESCUENTO' | 'PROMOCION';
export type RedemptionStatus = 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED';

// Tipos para Staff
export type StaffRole = 'TRAINER' | 'RECEPTIONIST' | 'MANAGER' | 'ADMIN';

// Tipos para Achievements
export type AchievementCategory = 'ASISTENCIA' | 'RUTINA' | 'ACTIVIDAD' | 'SOCIAL' | 'ESPECIAL';

// Puntos por tipo de check-in
export const POINTS_TABLE = {
  CHECK_IN_CLASS: 75,
  CHECK_IN_OPEN_GYM: 50,
  CHECK_IN_PT: 100,
  STREAK_BONUS_7_DAYS: 100,
  STREAK_BONUS_30_DAYS: 500,
  PERFECT_WEEK_BONUS: 200,
  REFERRAL_BONUS: 150,
} as const;

// Respuestas API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
