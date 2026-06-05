// ============================================
// CONFIGURACIÓN DE LA API - QUANTUM FIT
// ============================================

// ⚠️ IMPORTANTE: Cambiar TU_IP_AQUI por tu IP local real

// Para encontrar tu IP:
// 1. Abrir CMD (Símbolo del sistema)
// 2. Escribir: ipconfig
// 3. Buscar "IPv4" en la sección de Wi-Fi o Ethernet
// 4. Copiar esa IP (ej: 192.168.1.100)

export const API_CONFIG = {
  // Reemplazar TU_IP_AQUI con tu IP real
  BASE_URL: 'http://TU_IP_AQUI:3000/api',
  SOCKET_URL: 'http://TU_IP_AQUI:3000',
  TIMEOUT: 10000,
};

// ============================================
// EJEMPLO:
// Si tu IP es 192.168.1.100, debería quedar así:
// ============================================
// export const API_CONFIG = {
//   BASE_URL: 'http://192.168.1.100:3000/api',
//   SOCKET_URL: 'http://192.168.1.100:3000',
//   TIMEOUT: 10000,
// };
