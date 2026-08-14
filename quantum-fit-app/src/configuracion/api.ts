// Configuración de la API - QUANTUM FIT
//
// La IP se configura via variables de entorno de Expo:
//   1. Copiar .env.example a .env
//   2. Cambiar la IP por la de tu PC
//
// Para desarrollo local sin .env, usa localhost (solo emulador).

export const CONFIG_API = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
};

export const URL_API = CONFIG_API.BASE_URL;
export const URL_SOCKET = CONFIG_API.SOCKET_URL;
