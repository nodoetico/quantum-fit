// Paleta de colores QUANTUM FIT
export const colors = {
  // Colores principales
  primary: '#00F0FF', // Azul eléctrico neón
  primaryDark: '#00C8D4',
  secondary: '#39FF14', // Verde neón
  secondaryDark: '#2ECC71',
  
  // Fondos
  background: '#0A0A0A', // Negro profundo
  backgroundSecondary: '#121212', // Negro suave
  backgroundCard: '#1A1A1A', // Gris oscuro para tarjetas
  backgroundCardHover: '#252525',
  
  // Texto
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#6B6B6B',
  
  // Estados
  success: '#39FF14',
  warning: '#FFD700',
  error: '#FF4757',
  info: '#00F0FF',
  
  // Gradientes
  gradientStart: '#0A0A0A',
  gradientEnd: '#1A1A1A',
  
  // Bordes
  border: '#2A2A2A',
  borderLight: '#3A3A3A',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Puntos/Niveles
  points: '#FFD700',
  levelBronze: '#CD7F32',
  levelSilver: '#C0C0C0',
  levelGold: '#FFD700',
  levelPlatinum: '#E5E4E2',
  levelDiamond: '#B9F2FF',
};

// Tipografía
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Espaciado
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Bordes redondeados
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Sombras
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

// Duraciones de animación
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};
