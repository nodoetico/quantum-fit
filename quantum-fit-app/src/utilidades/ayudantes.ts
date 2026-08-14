import { colores } from '../constantes/tema';

/**
 * Formatea un número como puntos con separador de miles
 */
export const formatearPuntos = (puntos: number): string => {
  return puntos.toLocaleString('es-ES');
};

/**
 * Obtiene el color del nivel según los puntos
 */
export const obtenerColorNivel = (nivel: number): string => {
  if (nivel >= 11) return colores.primario;
  if (nivel >= 9) return colores.nivelDiamante;
  if (nivel >= 7) return colores.nivelPlatino;
  if (nivel >= 5) return colores.nivelOro;
  if (nivel >= 3) return colores.nivelPlata;
  return colores.nivelBronce;
};

/**
 * Obtiene el nombre del nivel
 */
export const obtenerNombreNivel = (nivel: number): string => {
  const niveles = [
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
  return niveles[Math.min(nivel - 1, niveles.length - 1)] || 'Leyenda';
};

/**
 * Obtiene el emoji del nivel
 */
export const obtenerEmojiNivel = (nivel: number): string => {
  const emojis = ['🌱', '🌱', '💪', '💪', '🔥', '🔥', '⭐', '⭐', '💎', '💎', '👑'];
  return emojis[Math.min(nivel - 1, emojis.length - 1)] || '👑';
};

const UMBRALES_NIVEL = [
  0,      // Nivel 1
  1000,   // Nivel 2
  2000,   // Nivel 3
  4000,   // Nivel 4
  6000,   // Nivel 5
  8000,   // Nivel 6
  10000,  // Nivel 7
  12000,  // Nivel 8
  14000,  // Nivel 9
  16000,  // Nivel 10
];

export const obtenerProgresoNivel = (puntosActuales: number, nivel: number): number => {
  let minimo: number;
  let maximo: number;

  if (nivel <= 1) {
    minimo = 0;
    maximo = UMBRALES_NIVEL[1];
  } else if (nivel >= UMBRALES_NIVEL.length) {
    const baseMin = UMBRALES_NIVEL[UMBRALES_NIVEL.length - 1];
    const nivelesExtra = nivel - UMBRALES_NIVEL.length;
    minimo = baseMin + nivelesExtra * 2000;
    maximo = baseMin + (nivelesExtra + 1) * 2000;
  } else {
    minimo = UMBRALES_NIVEL[nivel - 1];
    maximo = UMBRALES_NIVEL[nivel];
  }

  const rango = maximo - minimo;
  if (rango === 0) return 100;
  return ((puntosActuales - minimo) / rango) * 100;
};

/**
 * Formatea una fecha relativa (hace X horas, hace X días)
 */
export const formatearTiempoRelativo = (fecha: Date): string => {
  const ahora = new Date();
  const diferenciaMs = ahora.getTime() - fecha.getTime();
  const diferenciaMin = Math.floor(diferenciaMs / 60000);
  const diferenciaHoras = Math.floor(diferenciaMin / 60);
  const diferenciaDias = Math.floor(diferenciaHoras / 24);

  if (diferenciaMin < 1) return 'Ahora mismo';
  if (diferenciaMin < 60) return `Hace ${diferenciaMin} min`;
  if (diferenciaHoras < 24) return `Hace ${diferenciaHoras} h`;
  if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;

  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Obtiene el día de la semana abreviado
 */
export const obtenerDiaCorto = (fecha: Date): string => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return dias[fecha.getDay()];
};

/**
 * Verifica si una fecha es hoy
 */
export const esHoy = (fecha: Date): boolean => {
  const hoy = new Date();
  return (
    fecha.getDate() === hoy.getDate() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()
  );
};

/**
 * Obtiene el texto de dificultad y su color
 */
export const obtenerInfoDificultad = (dificultad: string) => {
  switch (dificultad) {
    case 'Principiante':
      return { color: colores.secundario, label: 'Fácil' };
    case 'Intermedio':
      return { color: colores.primario, label: 'Medio' };
    case 'Avanzado':
      return { color: colores.error, label: 'Difícil' };
    default:
      return { color: colores.textoSecundario, label: dificultad };
  }
};

/**
 * Genera un ID único
 */
export const generarId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida un email
 */
export const esEmailValido = (email: string): boolean => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};

/**
 * Trunca un texto si es muy largo
 */
export const truncarTexto = (texto: string, longitudMaxima: number): string => {
  if (texto.length <= longitudMaxima) return texto;
  return texto.substring(0, longitudMaxima - 3) + '...';
};

/**
 * Calcula el porcentaje de ocupación
 */
export const calcularOcupacion = (reservados: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((reservados / total) * 100);
};

/**
 * Obtiene el estado de ocupación
 */
export const obtenerEstadoOcupacion = (porcentaje: number) => {
  if (porcentaje >= 90) return { label: 'Muy lleno', color: colores.error };
  if (porcentaje >= 70) return { label: 'Llenándose', color: colores.advertencia };
  if (porcentaje >= 50) return { label: 'Disponible', color: colores.primario };
  return { label: 'Muy disponible', color: colores.secundario };
};
