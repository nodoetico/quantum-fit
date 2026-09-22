// Servicio de API para QUANTUM FIT
// IMPORTANTE: los endpoints y los campos que devuelve el backend se mantienen
// en inglés (son el contrato de la API).
import axios from 'axios';
import { obtenerItemSeguro, guardarItemSeguro, eliminarItemSeguro, CLAVES_ALMACENAMIENTO } from './almacenamientoSeguro';
import { URL_API, CONFIG_API } from '../configuracion/api';

// Crear instancia de axios
const clienteApi = axios.create({
  baseURL: URL_API,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: CONFIG_API.TIMEOUT,
});

// Endpoints que NO requieren token (ni deben enviarlo)
const ENDPOINTS_AUTH = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

// Interceptor para agregar token automáticamente
clienteApi.interceptors.request.use(
  async (config) => {
    const url = config.url || '';
    const esEndpointAuth = ENDPOINTS_AUTH.some((e) => url.includes(e));
    if (esEndpointAuth) {
      return config;
    }
    const token = await obtenerItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH);
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
let estaRefrescando = false;
let suscriptoresRefresh: Array<(token: string) => void> = [];

function alRefrescar(token: string) {
  suscriptoresRefresh.forEach(cb => cb(token));
  suscriptoresRefresh = [];
}

function agregarSuscriptorRefresh(cb: (token: string) => void) {
  suscriptoresRefresh.push(cb);
}

// Interceptor para manejar errores de autenticación
clienteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const esEndpointAuth = ENDPOINTS_AUTH.some((e) => url.includes(e));

      if (!esEndpointAuth) {
        if (!estaRefrescando) {
          estaRefrescando = true;
          try {
            const tokenRefreshGuardado = await obtenerItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_REFRESH);
            if (tokenRefreshGuardado) {
              const response = await axios.post(`${URL_API}/auth/refresh`, {
                refreshToken: tokenRefreshGuardado,
              });

              const { accessToken, refreshToken: nuevoTokenRefresh } = response.data.data;

              await guardarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH, accessToken);
              await guardarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_REFRESH, nuevoTokenRefresh);

              alRefrescar(accessToken);
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return clienteApi(error.config);
            }
          } catch (errorRefresh) {
            console.error('Error al refrescar el token:', errorRefresh);
            await eliminarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH);
            await eliminarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_REFRESH);
            await eliminarItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO);
          } finally {
            estaRefrescando = false;
          }
        } else {
          return new Promise((resolve) => {
            agregarSuscriptorRefresh((token: string) => {
              error.config.headers.Authorization = `Bearer ${token}`;
              resolve(clienteApi(error.config));
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

export const servicioAuth = {
  /**
   * Registrar nuevo usuario
   */
  async registrar(nombre: string, email: string, password: string, dni: string) {
    const response = await clienteApi.post('/auth/register', {
      name: nombre,
      email,
      password,
      dni,
    });

    const { user, accessToken, refreshToken } = response.data.data;

    // Guardar tokens y usuario
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH, accessToken);
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_REFRESH, refreshToken);
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO, JSON.stringify(user));

    return user;
  },

  /**
   * Iniciar sesión
   */
  async iniciarSesion(email: string, password: string) {
    const response = await clienteApi.post('/auth/login', {
      email,
      password,
    });

    const { user, accessToken, refreshToken } = response.data.data;

    // Guardar tokens y usuario
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH, accessToken);
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_REFRESH, refreshToken);
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO, JSON.stringify(user));

    return user;
  },

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    await eliminarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH);
    await eliminarItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_REFRESH);
    await eliminarItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO);
  },

  /**
   * Obtener usuario actual
   */
  async obtenerUsuarioActual() {
    try {
      const response = await clienteApi.get('/auth/me');
      const user = response.data.data;
      await guardarItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO, JSON.stringify(user));
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      const usuarioJson = await obtenerItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO);
      if (usuarioJson) {
        return JSON.parse(usuarioJson);
      }
      return null;
    }
  },

  /**
   * Actualizar perfil
   */
  async actualizarPerfil(data: { name?: string; avatarUrl?: string }) {
    const response = await clienteApi.put('/auth/profile', data);
    const user = response.data.data;

    // Actualizar usuario en storage
    await guardarItemSeguro(CLAVES_ALMACENAMIENTO.USUARIO, JSON.stringify(user));

    return user;
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  async olvideContrasena(email: string) {
    const response = await clienteApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  async restablecerContrasena(token: string, password: string) {
    const response = await clienteApi.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// ============================================
// SERVICIOS DE CHECK-INS
// ============================================

export const servicioCheckIn = {
  /**
   * Registrar check-in
   */
  async crearCheckIn(
    type: 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER',
    validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE',
    gymLocation?: string,
    notes?: string
  ) {
    const response = await clienteApi.post('/checkins', {
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
  async obtenerMisCheckIns(options?: {
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

    const response = await clienteApi.get(`/checkins/my-checkins?${params}`);
    return response.data.data;
  },

  /**
   * Obtener estadísticas de check-ins
   */
  async obtenerEstadisticas() {
    const response = await clienteApi.get('/checkins/stats');
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE USUARIO
// ============================================

export const servicioUsuario = {
  /**
   * Obtener perfil completo del usuario
   */
  async obtenerPerfil() {
    const response = await clienteApi.get('/auth/me');
    return response.data.data;
  },

  /**
   * Obtener actividad reciente
   */
  async obtenerRegistroActividad(limit: number = 50) {
    const response = await clienteApi.get(`/activity-log?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Obtener estadísticas semanales
   */
  async obtenerEstadisticasSemanales() {
    const response = await clienteApi.get('/stats/weekly');
    return response.data.data;
  },

  /**
   * Obtener logros
   */
  async obtenerLogros() {
    const response = await clienteApi.get('/achievements');
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE REWARDS
// ============================================

export const servicioPremios = {
  /**
   * Obtener todos los rewards
   */
  async obtenerTodos(categoria?: string) {
    const params = categoria ? `?category=${categoria}` : '';
    const response = await clienteApi.get(`/rewards${params}`);
    return response.data.data;
  },

  /**
   * Obtener rewards destacados
   */
  async obtenerDestacados() {
    const response = await clienteApi.get('/rewards/featured');
    return response.data.data;
  },

  /**
   * Obtener categorías
   */
  async obtenerCategorias() {
    const response = await clienteApi.get('/rewards/categories');
    return response.data.data;
  },

  /**
   * Canjear reward
   */
  async canjear(rewardId: string) {
    const response = await clienteApi.post(`/rewards/${rewardId}/redeem`);
    return response.data.data;
  },

  /**
   * Obtener rewards canjeados por el usuario
   */
  async obtenerMisPremios() {
    const response = await clienteApi.get('/rewards/my-rewards');
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE CLASES
// ============================================

export const servicioClases = {
  async obtenerTodas() {
    const response = await clienteApi.get('/classes');
    return response.data.data;
  },

  async obtenerPorId(id: string) {
    const response = await clienteApi.get(`/classes/${id}`);
    return response.data.data;
  },

  async reservar(id: string) {
    const response = await clienteApi.post(`/classes/${id}/book`);
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE BOOKINGS
// ============================================

export const servicioReservas = {
  async obtenerMisReservas() {
    const response = await clienteApi.get('/bookings/my');
    return response.data.data;
  },

  async cancelar(id: string) {
    const response = await clienteApi.put(`/bookings/${id}/cancel`);
    return response.data.data;
  },
};

// ============================================
// SERVICIOS DE RANKING
// ============================================

export const servicioRanking = {
  async obtenerTablaPosiciones(limit: number = 50) {
    const response = await clienteApi.get(`/ranking?limit=${limit}`);
    return response.data.data;
  },
};

// ============================================
// SERVICIO INTEGRACIÓN EXTERNA (MiFit/Crystal)
// ============================================

export const servicioPullExterno = {
  /**
   * Obtener perfil desde sistema externo (MiFit)
   */
  async obtenerPerfil(dni?: string) {
    const params = dni ? `?dni=${dni}` : '';
    const response = await clienteApi.get(`/external-pull/profile${params}`);
    return response.data.data;
  },

  /**
   * Obtener membresías desde sistema externo
   */
  async obtenerMembresias(dni?: string) {
    const params = dni ? `?dni=${dni}` : '';
    const response = await clienteApi.get(`/external-pull/memberships${params}`);
    return response.data;
  },

  /**
   * Obtener asistencias desde sistema externo
   */
  async obtenerAsistencias(dni?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (dni) params.append('dni', dni);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await clienteApi.get(`/external-pull/attendances?${params}`);
    return response.data;
  },

  /**
   * Obtener transacciones desde sistema externo
   */
  async obtenerTransacciones(dni?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (dni) params.append('dni', dni);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await clienteApi.get(`/external-pull/transactions?${params}`);
    return response.data;
  },

  /**
   * Obtener todos los datos del sistema externo
   */
  async obtenerTodo(dni?: string) {
    const params = dni ? `?dni=${dni}` : '';
    const response = await clienteApi.get(`/external-pull/all${params}`);
    return response.data.data;
  },

  /**
   * Probar conexión con sistema externo
   */
  async probarConexion() {
    const response = await clienteApi.get('/external-pull/test');
    return response.data;
  },
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Verificar si hay token válido
 */
export async function estaAutenticado(): Promise<boolean> {
  const token = await obtenerItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH);
  return !!token;
}

/**
 * Obtener token actual
 */
export async function obtenerToken(): Promise<string | null> {
  return obtenerItemSeguro(CLAVES_ALMACENAMIENTO.TOKEN_AUTH);
}

// ============================================
// SERVICIO DE PAGOS (Crystal MiFit Proxy)
// ============================================

export const servicioPagos = {
  /**
   * Obtiene los métodos de pago disponibles en el gimnasio.
   */
  async obtenerMetodosPago() {
    const response = await clienteApi.get('/payments/methods');
    return response.data.data as import('../tipos').MetodoPago[];
  },

  /**
   * Obtiene el estado actual de la inscripción desde Crystal.
   */
  async obtenerEstadoInscripcion() {
    const response = await clienteApi.get('/payments/enrollment');
    return response.data.data as import('../tipos').InscripcionCrystal;
  },

  /**
   * Procesa el pago y renovación de inscripción a través de Crystal.
   * @param paymentMethodId - ID del método de pago seleccionado
   * @param comments - Comentario opcional
   */
  async renovarInscripcion(paymentMethodId: number, comments?: string) {
    const response = await clienteApi.post('/payments/enrollment/renew', {
      paymentMethodId,
      ...(comments ? { comments } : {}),
    });
    return response.data as {
      success: boolean;
      message: string;
      data: import('../tipos').RespuestaRenovarInscripcion;
    };
  },

  /**
   * Renueva una membresía específica a través de Crystal.
   */
  async renovarMembresia(membershipId: number, paymentMethodId: number, comments?: string) {
    const response = await clienteApi.post('/payments/memberships/renew', {
      membershipId,
      paymentMethodId,
      ...(comments ? { comments } : {}),
    });
    return response.data;
  },

  /**
   * Obtiene el historial de transacciones desde Crystal.
   */
  async obtenerTransacciones(perPage: number = 15) {
    const response = await clienteApi.get(`/payments/transactions?perPage=${perPage}`);
    return response.data.data as import('../tipos').TransaccionCrystal[];
  },

  /**
   * Obtiene la suscripción del usuario desde nuestra BD local.
   */
  async obtenerMiSuscripcion() {
    const response = await clienteApi.get('/payments/subscription');
    return response.data.data as import('../tipos').SuscripcionLocal;
  },

  /**
   * Obtiene el historial de pagos desde nuestra BD local.
   */
  async obtenerMiHistorialPagos() {
    const response = await clienteApi.get('/payments/history');
    return response.data.data as import('../tipos').PagoLocal[];
  },
};

// ============================================
// SERVICIO MERCADOPAGO
// ============================================

export const servicioMercadoPago = {
  /**
   * Crea una preferencia de pago en MercadoPago y devuelve la URL de checkout.
   */
  async crearPreferencia(planId: string, planName: string, price: number) {
    const response = await clienteApi.post('/mercadopago/create-preference', {
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

// ============================================
// SERVICIO VINCULACIÓN MYFIT (modelo espejo)
// ============================================

export const servicioMyFit = {
  /**
   * Vincula la cuenta MyFit del socio (email o dni + password). El backend guarda
   * la sesión cifrada y opera con el token del socio.
   */
  async vincular(identificador: string, password: string, esDni = false) {
    const response = await clienteApi.post('/crystal-membership/link', {
      ...(esDni ? { dni: identificador } : { email: identificador }),
      password,
    });
    return response.data.data as import('../tipos').EstadoVinculacionMyFit;
  },

  /**
   * Consulta si el socio tiene una cuenta MyFit vinculada.
   */
  async obtenerEstadoVinculacion() {
    const response = await clienteApi.get('/crystal-membership/status');
    return response.data.data as import('../tipos').EstadoVinculacionMyFit;
  },

  /**
   * Desvincula la cuenta MyFit del socio.
   */
  async desvincular() {
    const response = await clienteApi.post('/crystal-membership/logout');
    return response.data.data;
  },

  /**
   * Crea la cuenta del socio en MyFit (name, dni, email?, phone?, password).
   * Se usa cuando el socio todavía no tiene cuenta en el sistema del gimnasio.
   */
  async registrar(datos: { name: string; dni: string; email?: string; phone?: string; password: string }) {
    const response = await clienteApi.post('/crystal-membership/register', datos);
    return response.data;
  },

  /**
   * Obtiene el perfil real del socio desde MyFit.
   */
  async obtenerPerfil() {
    const response = await clienteApi.get('/crystal-membership/profile');
    return response.data.data as import('../tipos').PerfilMyFit;
  },

  /**
   * Obtiene las membresías reales del socio desde MyFit.
   */
  async obtenerMembresias() {
    const response = await clienteApi.get('/crystal-membership/memberships');
    return response.data.data as import('../tipos').MembresiaMyFit[];
  },

  /**
   * Obtiene las asistencias reales del socio desde MyFit.
   */
  async obtenerAsistencias(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await clienteApi.get(`/crystal-membership/attendances?${params}`);
    return response.data.data as import('../tipos').AsistenciaMyFit[];
  },

  /**
   * Obtiene el estado de inscripción real del socio desde MyFit.
   */
  async obtenerInscripcion() {
    const response = await clienteApi.get('/crystal-membership/enrollment');
    return response.data.data as import('../tipos').InscripcionMyFit;
  },

  /**
   * Obtiene las transacciones reales del socio desde MyFit.
   */
  async obtenerTransacciones(startDate?: string, endDate?: string, perPage?: number) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (perPage) params.append('perPage', perPage.toString());
    const response = await clienteApi.get(`/crystal-membership/transactions?${params}`);
    return response.data.data as import('../tipos').TransaccionMyFit[];
  },

  /**
   * Obtiene los planes de membresía disponibles.
   */
  async obtenerPlanes() {
    const response = await clienteApi.get('/crystal-membership/plans');
    return response.data.data as import('../tipos').PlanMyFit[];
  },

  /**
   * Contrata (o renueva) una membresía para el socio usando su sesión MyFit.
   */
  async contratarMembresia(membershipId: number, paymentMethodId: number, comments?: string) {
    const response = await clienteApi.post('/crystal-membership/contract', {
      membershipId,
      paymentMethodId,
      ...(comments ? { comments } : {}),
    });
    return response.data;
  },

  /**
   * Actualiza el perfil del socio en MyFit.
   */
  async actualizarPerfil(data: Record<string, unknown>) {
    const response = await clienteApi.patch('/crystal-membership/profile', data);
    return response.data.data as import('../tipos').PerfilMyFit;
  },

  /**
   * Actualiza el contacto de emergencia del socio en MyFit.
   */
  async actualizarContactoEmergencia(data: Record<string, unknown>) {
    const response = await clienteApi.patch('/crystal-membership/emergency-contact', data);
    return response.data.data;
  },

  /**
   * Cambia la contraseña del socio en MyFit.
   */
  async cambiarContrasena(currentPassword: string, newPassword: string) {
    const response = await clienteApi.post('/crystal-membership/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default clienteApi;
