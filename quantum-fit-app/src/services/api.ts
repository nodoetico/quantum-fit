// Servicio de API para QUANTUM FIT
import axios from 'axios';
import { secureGetItem, secureSetItem, secureRemoveItem, STORAGE_KEYS } from './secureStorage';
import { API_URL, API_CONFIG } from '../config/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Endpoints que NO requieren token (ni deben enviarlo)
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    const url = config.url || '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => url.includes(e));
    if (isAuthEndpoint) {
      return config;
    }
    const token = await secureGetItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cola de refresh para evitar race conditions
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => url.includes(e));

      if (!isAuthEndpoint) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const storedRefreshToken = await secureGetItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (storedRefreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: storedRefreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;

              await secureSetItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
              await secureSetItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

              onRefreshed(accessToken);
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return api(error.config);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            await secureRemoveItem(STORAGE_KEYS.AUTH_TOKEN);
            await secureRemoveItem(STORAGE_KEYS.REFRESH_TOKEN);
            await secureRemoveItem(STORAGE_KEYS.USER);
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve) => {
            addRefreshSubscriber((token: string) => {
              error.config.headers.Authorization = `Bearer ${token}`;
              resolve(api(error.config));
            });
          });
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================

export const authService = {
  /**
   * Registrar nuevo usuario
   */
  async register(name: string, email: string, password: string) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });

    const { user, accessToken, refreshToken } = response.data.data;

    // Guardar tokens y usuario
    await secureSetItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await secureSetItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await secureSetItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  },

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { user, accessToken, refreshToken } = response.data.data;

    // Guardar tokens y usuario
    await secureSetItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await secureSetItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await secureSetItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    await secureRemoveItem(STORAGE_KEYS.AUTH_TOKEN);
    await secureRemoveItem(STORAGE_KEYS.REFRESH_TOKEN);
    await secureRemoveItem(STORAGE_KEYS.USER);
  },

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      await secureSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      const userJson = await secureGetItem(STORAGE_KEYS.USER);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    }
  },

  /**
   * Actualizar perfil
   */
  async updateProfile(data: { name?: string; avatarUrl?: string }) {
    const response = await api.put('/auth/profile', data);
    const user = response.data.data;
    
    // Actualizar usuario en storage
    await secureSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return user;
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// ============================================
// SERVICIOS DE CHECK-INS
// ============================================

export const checkInService = {
  /**
   * Registrar check-in
   */
  async createCheckIn(
    type: 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER',
    validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE',
    gymLocation?: string,
    notes?: string
  ) {
    const response = await api.post('/checkins', {
      type,
      validationMethod,
      gymLocation,
      notes,
    });

    return response.data.data;
  },

  /**
   * Obtener historial de check-ins
   */
  async getMyCheckIns(options?: {
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    
    if (options?.from) params.append('from', options.from);
    if (options?.to) params.append('to', options.to);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await api.get(`/checkins/my-checkins?${params}`);
    return response.data.data;
  },

  /**
   * Obtener estadísticas de check-ins
   */
  async getStats() {
    const response = await api.get('/checkins/stats');
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE USUARIO
// ============================================

export const userService = {
  /**
   * Obtener perfil completo del usuario
   */
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  /**
   * Obtener actividad reciente
   */
  async getActivityLog(limit: number = 50) {
    const response = await api.get(`/activity-log?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Obtener estadísticas semanales
   */
  async getWeeklyStats() {
    const response = await api.get('/stats/weekly');
    return response.data.data;
  },

  /**
   * Obtener logros
   */
  async getAchievements() {
    const response = await api.get('/achievements');
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE REWARDS
// ============================================

export const rewardsService = {
  /**
   * Obtener todos los rewards
   */
  async getAll(category?: string) {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/rewards${params}`);
    return response.data.data;
  },

  /**
   * Obtener rewards destacados
   */
  async getFeatured() {
    const response = await api.get('/rewards/featured');
    return response.data.data;
  },

  /**
   * Obtener categorías
   */
  async getCategories() {
    const response = await api.get('/rewards/categories');
    return response.data.data;
  },

  /**
   * Canjear reward
   */
  async redeem(rewardId: string) {
    const response = await api.post(`/rewards/${rewardId}/redeem`);
    return response.data.data;
  },

  /**
   * Obtener rewards canjeados por el usuario
   */
  async getMyRewards() {
    const response = await api.get('/rewards/my-rewards');
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE CLASES
// ============================================

export const classesService = {
  async getAll() {
    const response = await api.get('/classes');
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  },

  async book(id: string) {
    const response = await api.post(`/classes/${id}/book`);
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE BOOKINGS
// ============================================

export const bookingsService = {
  async getMyBookings() {
    const response = await api.get('/bookings/my');
    return response.data.data;
  },

  async cancel(id: string) {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE RANKING
// ============================================

export const rankingService = {
  async getLeaderboard(limit: number = 50) {
    const response = await api.get(`/ranking?limit=${limit}`);
    return response.data.data;
  },
};

// ============================================
// SERVICIO INTEGRACIÓN EXTERNA (MiFit/Crystal)
// ============================================

export const externalPullService = {
  /**
   * Obtener perfil desde sistema externo (MiFit)
   */
  async getProfile(dni?: string) {
    const params = dni ? `?dni=${dni}` : '';
    const response = await api.get(`/external-pull/profile${params}`);
    return response.data.data;
  },

  /**
   * Obtener membresías desde sistema externo
   */
  async getMemberships(dni?: string) {
    const params = dni ? `?dni=${dni}` : '';
    const response = await api.get(`/external-pull/memberships${params}`);
    return response.data;
  },

  /**
   * Obtener asistencias desde sistema externo
   */
  async getAttendances(dni?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (dni) params.append('dni', dni);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/external-pull/attendances?${params}`);
    return response.data;
  },

  /**
   * Obtener transacciones desde sistema externo
   */
  async getTransactions(dni?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (dni) params.append('dni', dni);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/external-pull/transactions?${params}`);
    return response.data;
  },

  /**
   * Obtener todos los datos del sistema externo
   */
  async getAll(dni?: string) {
    const params = dni ? `?dni=${dni}` : '';
    const response = await api.get(`/external-pull/all${params}`);
    return response.data.data;
  },

  /**
   * Probar conexión con sistema externo
   */
  async testConnection() {
    const response = await api.get('/external-pull/test');
    return response.data;
  },
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Verificar si hay token válido
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await secureGetItem(STORAGE_KEYS.AUTH_TOKEN);
  return !!token;
}

/**
 * Obtener token actual
 */
export async function getToken(): Promise<string | null> {
  return secureGetItem(STORAGE_KEYS.AUTH_TOKEN);
}

// ============================================
// SERVICIO DE PAGOS (Crystal MiFit Proxy)
// ============================================

export const paymentService = {
  /**
   * Obtiene los métodos de pago disponibles en el gimnasio.
   */
  async getPaymentMethods() {
    const response = await api.get('/payments/methods');
    return response.data.data as import('../types').PaymentMethod[];
  },

  /**
   * Obtiene el estado actual de la inscripción desde Crystal.
   */
  async getEnrollmentStatus() {
    const response = await api.get('/payments/enrollment');
    return response.data.data as import('../types').CrystalEnrollment;
  },

  /**
   * Procesa el pago y renovación de inscripción a través de Crystal.
   * @param paymentMethodId - ID del método de pago seleccionado
   * @param comments - Comentario opcional
   */
  async renewEnrollment(paymentMethodId: number, comments?: string) {
    const response = await api.post('/payments/enrollment/renew', {
      paymentMethodId,
      ...(comments ? { comments } : {}),
    });
    return response.data as {
      success: boolean;
      message: string;
      data: import('../types').RenewEnrollmentResponse;
    };
  },

  /**
   * Renueva una membresía específica a través de Crystal.
   */
  async renewMembership(membershipId: number, paymentMethodId: number, comments?: string) {
    const response = await api.post('/payments/memberships/renew', {
      membershipId,
      paymentMethodId,
      ...(comments ? { comments } : {}),
    });
    return response.data;
  },

  /**
   * Obtiene el historial de transacciones desde Crystal.
   */
  async getTransactions(perPage: number = 15) {
    const response = await api.get(`/payments/transactions?perPage=${perPage}`);
    return response.data.data as import('../types').CrystalTransaction[];
  },

  /**
   * Obtiene la suscripción del usuario desde nuestra BD local.
   */
  async getMySubscription() {
    const response = await api.get('/payments/subscription');
    return response.data.data as import('../types').LocalSubscription;
  },

  /**
   * Obtiene el historial de pagos desde nuestra BD local.
   */
  async getMyPaymentHistory() {
    const response = await api.get('/payments/history');
    return response.data.data as import('../types').LocalPayment[];
  },
};

// ============================================
// SERVICIO MERCADOPAGO
// ============================================

export const mercadopagoService = {
  /**
   * Crea una preferencia de pago en MercadoPago y devuelve la URL de checkout.
   */
  async createPreference(planId: string, planName: string, price: number) {
    const response = await api.post('/mercadopago/create-preference', {
      planId,
      planName,
      price,
    });
    return response.data.data as {
      id: string;
      initPoint: string;
      sandboxInitPoint: string;
    };
  },
};

export default api;
