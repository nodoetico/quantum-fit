// Paleta de colores QUANTUM FIT
export const colores = {
  // Colores principales
  primario: '#00F0FF', // Azul eléctrico neón
  primarioOscuro: '#00C8D4',
  secundario: '#39FF14', // Verde neón
  secundarioOscuro: '#2ECC71',

  // Fondos
  fondo: '#0A0A0A', // Negro profundo
  fondoSecundario: '#121212', // Negro suave
  fondoTarjeta: '#1A1A1A', // Gris oscuro para tarjetas
  fondoTarjetaHover: '#252525',

  // Texto
  textoPrincipal: '#FFFFFF',
  textoSecundario: '#B0B0B0',
  textoAtenuado: '#6B6B6B',

  // Estados
  exito: '#39FF14',
  advertencia: '#FFD700',
  error: '#FF4757',
  informacion: '#00F0FF',

  // Gradientes
  inicioGradiente: '#0A0A0A',
  finGradiente: '#1A1A1A',

  // Bordes
  borde: '#2A2A2A',
  bordeClaro: '#3A3A3A',

  // Overlay
  superposicion: 'rgba(0, 0, 0, 0.8)',
  superposicionClara: 'rgba(0, 0, 0, 0.5)',

  // Puntos/Niveles
  puntos: '#FFD700',
  nivelBronce: '#CD7F32',
  nivelPlata: '#C0C0C0',
  nivelOro: '#FFD700',
  nivelPlatino: '#E5E4E2',
  nivelDiamante: '#B9F2FF',
};

// Tipografía
export const tipografia = {
  familiaFuente: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  tamanos: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  pesos: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Espaciado
export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Bordes redondeados
export const radioBorde = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Sombras
export const sombras = {
  pequena: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  mediana: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  grande: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  brillo: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

// Duraciones de animación
export const animaciones = {
  duracion: {
    rapida: 150,
    normal: 300,
    lenta: 500,
  },
};
