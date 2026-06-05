import { colors } from '../constants/theme';

/**
 * Formatea un número como puntos con separador de miles
 */
export const formatPoints = (points: number): string => {
  return points.toLocaleString('es-ES');
};

/**
 * Obtiene el color del nivel según los puntos
 */
export const getLevelColor = (level: number): string => {
  if (level >= 11) return colors.primary;
  if (level >= 9) return colors.levelDiamond;
  if (level >= 7) return colors.levelPlatinum;
  if (level >= 5) return colors.levelGold;
  if (level >= 3) return colors.levelSilver;
  return colors.levelBronze;
};

/**
 * Obtiene el nombre del nivel
 */
export const getLevelName = (level: number): string => {
  const levels = [
    'Principiante',
    'Principiante',
    'Intermedio',
    'Intermedio',
    'Avanzado',
    'Avanzado',
    'Experto',
    'Experto',
    'Élite',
    'Élite',
    'Leyenda',
  ];
  return levels[Math.min(level - 1, levels.length - 1)] || 'Leyenda';
};

/**
 * Obtiene el emoji del nivel
 */
export const getLevelEmoji = (level: number): string => {
  const emojis = ['🌱', '🌱', '💪', '💪', '🔥', '🔥', '⭐', '⭐', '💎', '💎', '👑'];
  return emojis[Math.min(level - 1, emojis.length - 1)] || '👑';
};

const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2000,   // Level 3
  4000,   // Level 4
  6000,   // Level 5
  8000,   // Level 6
  10000,  // Level 7
  12000,  // Level 8
  14000,  // Level 9
  16000,  // Level 10
];

export const getLevelProgress = (currentPoints: number, level: number): number => {
  let min: number;
  let max: number;

  if (level <= 1) {
    min = 0;
    max = LEVEL_THRESHOLDS[1];
  } else if (level >= LEVEL_THRESHOLDS.length) {
    const baseMin = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extraLevels = level - LEVEL_THRESHOLDS.length;
    min = baseMin + extraLevels * 2000;
    max = baseMin + (extraLevels + 1) * 2000;
  } else {
    min = LEVEL_THRESHOLDS[level - 1];
    max = LEVEL_THRESHOLDS[level];
  }

  const range = max - min;
  if (range === 0) return 100;
  return ((currentPoints - min) / range) * 100;
};

/**
 * Formatea una fecha relativa (hace X horas, hace X días)
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Obtiene el día de la semana abreviado
 */
export const getShortDayName = (date: Date): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Obtiene el texto de dificultad y su color
 */
export const getDifficultyInfo = (difficulty: string) => {
  switch (difficulty) {
    case 'Principiante':
      return { color: colors.secondary, label: 'Fácil' };
    case 'Intermedio':
      return { color: colors.primary, label: 'Medio' };
    case 'Avanzado':
      return { color: colors.error, label: 'Difícil' };
    default:
      return { color: colors.textSecondary, label: difficulty };
  }
};

/**
 * Genera un ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Trunca un texto si es muy largo
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Calcula el porcentaje de ocupación
 */
export const calculateOccupancy = (booked: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((booked / total) * 100);
};

/**
 * Obtiene el estado de ocupación
 */
export const getOccupancyStatus = (percentage: number) => {
  if (percentage >= 90) return { label: 'Muy lleno', color: colors.error };
  if (percentage >= 70) return { label: 'Llenándose', color: colors.warning };
  if (percentage >= 50) return { label: 'Disponible', color: colors.primary };
  return { label: 'Muy disponible', color: colors.secondary };
};
