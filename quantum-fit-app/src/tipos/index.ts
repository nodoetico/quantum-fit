// Tipos de datos de QUANTUM FIT
// IMPORTANTE: los nombres de los campos se mantienen en inglés porque reflejan
// el contrato de la API del backend (renombrarlos rompería la app).

export interface Usuario {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  points: number;
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: Date;
  rank: number;
  notificationsCount?: number;
  isVip?: boolean;
  vipSince?: string | null;
  dni?: string | null;
}

export interface Premio {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  imageUrl: string | null;
  category: string;
  stockAvailable: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface Logro {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'asistencia' | 'rutina' | 'actividad' | 'social';
}

export interface RegistroActividad {
  id: string;
  userId: string;
  type: 'workout' | 'class' | 'achievement' | 'booking';
  points: number;
  date: Date;
  description: string;
}

export interface EstadisticasSemana {
  id?: string;
  userId?: string;
  year: number;
  week: number;
  weekStartDate: Date;
  weekEndDate: Date;
  workoutsCompleted: number;
  classesAttended: number;
  totalPoints: number;
  totalCheckIns: number;
  attendanceRate: number;
  activeDays: number;
  activeDaysBitmap: number;
  isPerfectWeek: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EstadisticasSemanales {
  currentWeek: EstadisticasSemana;
  previousWeeks: EstadisticasSemana[];
  summary: {
    totalWeeks: number;
    perfectWeeks: number;
    totalWorkouts: number;
    totalPoints: number;
  };
}

export interface Reserva {
  id: string;
  class?: {
    id: string;
    name: string;
    description: string | null;
    instructorName: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    totalSpots: number;
    bookedSpots: number;
    activityType: string;
    difficultyLevel: string;
    location: string | null;
    gymZone: string | null;
  };
  status?: string;
  createdAt?: string;
}

export interface Notificacion {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'promotion' | 'general';
  read: boolean;
  createdAt: Date;
}

// ============================================
// TIPOS DE PAGOS Y SUSCRIPCIONES
// ============================================

export interface MetodoPago {
  id: number;
  name: string;
}

export interface InscripcionCrystal {
  enrollment: {
    is_enrolled: boolean;
    due_date: string | null;
    is_expired: boolean;
    last_payment_date: string | null;
  } | null;
  renewal: {
    price: number;
    months: number;
    next_due_date: string;
  } | null;
}

export interface TransaccionCrystal {
  id: number;
  visual_id: string;
  title: string;
  category: string | null;
  date: string;
  total_amount: number;
  paid_amount: number;
  debt: number;
  is_paid: boolean;
  comments: string | null;
}

export interface SuscripcionLocal {
  hasSubscription: boolean;
  isVip: boolean;
  vipSince: string | null;
  subscription: {
    id: string;
    type: string;
    status: string;
    price: number;
    currency: string;
    billingCycle: string;
    startDate: string;
    endDate: string | null;
    nextBillingDate: string | null;
    isExpired: boolean;
  } | null;
}

export interface PagoLocal {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PreferenciaMercadoPago {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export interface RespuestaRenovarInscripcion {
  enrollment: {
    is_enrolled: boolean;
    due_date: string;
    is_expired: boolean;
    last_payment_date: string | null;
  };
  isVip: boolean;
}
